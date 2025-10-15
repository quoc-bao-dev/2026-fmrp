import React, { useEffect, useMemo, useRef, useState } from "react";

/*
  OtpInput
  Props:
    - length: number (required) -> number of input boxes
    - onComplete: (value: string) => void (optional) -> fires when all boxes filled
*/
const OtpInput = ({ length = 6, onComplete }) => {
  const inputRefs = useRef([]);
  const [values, setValues] = useState(() => Array.from({ length }, () => ""));

  useEffect(() => {
    if (!Array.isArray(inputRefs.current)) inputRefs.current = [];
  }, []);

  useEffect(() => {
    if (values.every((v) => v !== "")) {
      const code = values.join("");
      if (typeof onComplete === "function") onComplete(code);
    }
  }, [values, onComplete]);

  const focusAt = (idx) => {
    const el = inputRefs.current[idx];
    if (el && typeof el.focus === "function") el.focus();
  };

  const firstEmptyIndex = useMemo(() => {
    const i = values.findIndex((v) => v === "");
    return i === -1 ? length - 1 : i;
  }, [values, length]);

  // Always keep focus on the first empty input
  useEffect(() => {
    focusAt(firstEmptyIndex);
  }, [firstEmptyIndex]);

  const handleChange = (e, idx) => {
    const raw = e.target.value;
    const nextChar = (raw || "").replace(/\D/g, "").slice(-1);
    setValues((prev) => {
      const next = [...prev];
      next[idx] = nextChar;
      return next;
    });
    if (nextChar && idx < length - 1) focusAt(idx + 1);
  };

  const handleKeyDown = (e, idx) => {
    const key = e.key;
    if (key === "Backspace") {
      if (values[idx]) {
        setValues((prev) => {
          const next = [...prev];
          next[idx] = "";
          return next;
        });
      } else if (idx > 0) {
        focusAt(idx - 1);
        setValues((prev) => {
          const next = [...prev];
          next[idx - 1] = "";
          return next;
        });
      }
    }
    if (key === "ArrowLeft" && idx > 0) {
      e.preventDefault();
      focusAt(idx - 1);
    }
    if (key === "ArrowRight" && idx < length - 1) {
      e.preventDefault();
      focusAt(idx + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData.getData("text") || "").replace(/\D/g, "");
    if (!pasted) return;
    setValues((prev) => {
      const next = [...prev];
      for (let i = 0; i < length; i++) {
        next[i] = pasted[i] || next[i] || "";
      }
      // After paste, focus first empty (or last if filled)
      const emptyIdx = next.findIndex((v) => v === "");
      setTimeout(() => focusAt(emptyIdx === -1 ? length - 1 : emptyIdx), 0);
      return next;
    });
  };

  const boxClass =
    "w-[68px] h-[68px] text-center rounded-[12px] border border-[#E4E7EC] flex items-center justify-center text-[40px] font-semibold text-[#11315B] focus:outline-none focus:border-[#0F4F9E] focus:ring-2 focus:ring-[#0F4F9E]/20 transition-all";

  return (
    <div className="flex" style={{ gap: 12 }} onPaste={handlePaste}>
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => (inputRefs.current[idx] = el)}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={1}
          className={boxClass}
          value={values[idx]}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onMouseDown={(e) => {
            if (idx !== firstEmptyIndex) {
              e.preventDefault();
              focusAt(firstEmptyIndex);
            }
          }}
          onFocus={(e) => {
            if (idx !== firstEmptyIndex) {
              e.preventDefault();
              focusAt(firstEmptyIndex);
            }
          }}
        />
      ))}
    </div>
  );
};

export default OtpInput;
