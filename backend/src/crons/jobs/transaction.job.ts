import mongoose from "mongoose";
import { TransactionModel } from "../../models/transaction.model.js";
import { calculateNextOccurrence } from "../../utils/helper.js";
import { Logger } from "../../utils/logger.js";

export const processRecurringTransactions = async () => {
  const now = new Date();
  let processedCount = 0;
  let failedCount = 0;

  try {
    const transactionCursor = TransactionModel.find({
      isRecurring: true,
      nextRecurringDate: { $lte: now },
    }).cursor();

    Logger.info("Starting recurring transaction processing");

    for await (const tx of transactionCursor) {
      const nextDate = calculateNextOccurrence(
        tx.nextRecurringDate!,
        tx.recurringInterval!
      );

      Logger.debug("Processing recurring transaction", {
        transactionId: tx._id,
        title: tx.title,
        currentNextRecurringDate: tx.nextRecurringDate,
        calculatedNextDate: nextDate,
      });

      const session = await mongoose.startSession();
      try {
        await session.withTransaction(
          async () => {
            const {
              _id: _oldId,
              createdAt,
              updatedAt,
              recurringInterval,
              nextRecurringDate: _oldNextDate,
              lastProcessed,
              ...txData
            } = tx.toObject({ virtuals: false });

            await TransactionModel.create(
              [
                {
                  ...txData,
                  title: `Recurring - ${tx.title}`,
                  date: tx.nextRecurringDate ?? now,
                  isRecurring: false,
                },
              ],
              { session }
            );

            Logger.debug("Created new recurring transaction instance", {
              originalTransactionId: tx._id,
              newTransactionDate: tx.nextRecurringDate ?? now,
            });

            await TransactionModel.updateOne(
              { _id: tx._id },
              {
                $set: {
                  nextRecurringDate: nextDate,
                  lastProcessed: now,
                },
              },
              { session }
            );
          },
          {
            maxCommitTimeMS: 20000,
          }
        );

        processedCount++;
        Logger.debug("Successfully processed recurring transaction", {
          transactionId: tx._id,
          nextScheduledDate: nextDate,
        });
      } catch (error: any) {
        failedCount++;
        Logger.error("Failed to process recurring transaction", error, {
          transactionId: tx._id,
          title: tx.title,
        });
      } finally {
        await session.endSession();
      }
    }

    Logger.info("Recurring transaction processing completed", {
      "✅ Processed": processedCount,
      "❌ Failed": failedCount,
      "Total Attempted": processedCount + failedCount,
    });

    return {
      success: true,
      processedCount,
      failedCount,
    };
  } catch (error: any) {
    Logger.error("Critical error during recurring transaction processing", error);

    return {
      success: false,
      error: error?.message,
    };
  }
};