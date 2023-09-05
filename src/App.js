import React, { useState } from "react";
import CustomTextArea from "./CustomTextArea";
import "./App.css";

const App = () => {
  const [value, setValue] = useState("");
  const [audioText, setAudioText] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isTextAreaFocused, setIsTextAreaFocused] = useState(false);
  const [shouldUpdateInnerValue, setShouldUpdateInnerValue] = useState(false);
  const [pauseClickCount, setPauseClickCount] = useState(0);
  const [pausePosition, setPausePosition] = useState(0);

  const onPauseButtonClick = () => {
    if (value.trim().length === 0) {
      const newValue = "@[Pause 0.2s](default:0)";
      setValue(newValue);
      setPausePosition(newValue.length);
      setCursorPosition(newValue.length);
    } else {
      const beforeCursor = value.substring(0, cursorPosition).trim();
      const afterCursor = value.substring(cursorPosition, value.length).trim();
      setValue(beforeCursor + "@[Pause 0.2s](default:0)" + afterCursor);

      const prefix = beforeCursor + "@[Pause 0.2s](default:0)";
      setPausePosition(prefix.length);
      setCursorPosition(prefix.length);
    }

    setIsTextAreaFocused(false);
    setPauseClickCount(pauseClickCount + 1);
  };

  return (
    <div className="main">
      <h4>Audio Text : {audioText}</h4>
      <h4>Value : {value}</h4>
      <CustomTextArea
        value={value}
        setValue={setValue}
        setAudioText={setAudioText}
        setCursorPosition={setCursorPosition}
        isEditingMiddle={isTextAreaFocused}
        setIsEditingMiddle={setIsTextAreaFocused}
        setShouldUpdateInnerValue={setShouldUpdateInnerValue}
        shouldUpdateInnerValue={shouldUpdateInnerValue}
        pauseClickCount={pauseClickCount}
        pausePosition={pausePosition}
      />
      <div
        className="pause-button"
        onClick={onPauseButtonClick}
      >
        Pause
      </div>
    </div>
  );
};

export default App;
