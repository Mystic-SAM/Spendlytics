import { type KeyboardEvent, useRef, useEffect, type ClipboardEvent } from "react";

interface PropType {
  noOfDigits: number;
  value: string[];
  onChange: (values: string[]) => void;
}

const OTPInput = ({ noOfDigits, value, onChange }: PropType) => {
  const inputReferences = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus the first empty slot whenever value changes externally
  useEffect(() => {
    const firstEmpty = value.findIndex((v) => v === "");
    const target = firstEmpty === -1 ? noOfDigits - 1 : firstEmpty;
    inputReferences.current[target]?.focus();
  }, []);

  const handleInputChange = (rawValue: string, index: number) => {
    if (isNaN(Number(rawValue))) return;

    const digit = rawValue.trim().slice(-1);
    const updated = [...value];
    updated[index] = digit;
    onChange(updated);

    if (digit && index !== noOfDigits - 1) {
      inputReferences.current[index + 1]?.focus();
    }
  };

  const handleInputKeydown = (evt: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (evt.key === "Backspace") {
      if (!evt.currentTarget.value && index > 0) {
        inputReferences.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (evt: ClipboardEvent<HTMLInputElement>, startIndex: number) => {
    evt.preventDefault();
    const pastedText = evt.clipboardData.getData("text").replace(/\D/g, "");
    if (!pastedText) return;

    const updated = [...value];
    let focusIndex = startIndex;
    for (let i = 0; i < pastedText.length && startIndex + i < noOfDigits; i++) {
      updated[startIndex + i] = pastedText[i];
      focusIndex = startIndex + i;
    }
    onChange(updated);

    const nextFocus = Math.min(focusIndex + 1, noOfDigits - 1);
    inputReferences.current[nextFocus]?.focus();
  };

  return (
    <div className="flex items-center gap-2 w-full">
      {Array.from({ length: noOfDigits }).map((_v, index) => (
        <input
          ref={(input) => { inputReferences.current[index] = input; }}
          className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-semibold bg-transparent border-2 border-input rounded-md text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
          key={index}
          value={value[index]}
          inputMode="numeric"
          onChange={(e) => handleInputChange(e.target.value, index)}
          onKeyDown={(e) => handleInputKeydown(e, index)}
          onPaste={(e) => handlePaste(e, index)}
        />
      ))}
    </div>
  );
};

export default OTPInput;
