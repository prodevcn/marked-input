import React, { useState } from "react";
import CustomTextArea from "./CustomTextArea";
import TextArea from "./TextArea";
import "./App.css";

const App = () => {
  const [value, setValue] = useState("");
  const [audioText, setAudioText] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isTextAreaFocused, setIsTextAreaFocused] = useState(false);
  const [shouldUpdateInnerValue, setShouldUpdateInnerValue] = useState(false);
  const [pauseClickCount, setPauseClickCount] = useState(0);
  const [pausePosition, setPausePosition] = useState(0);

  const [value1, setValue1] = useState("");
  const [audioText1, setAudioText1] = useState("");
  const [cursorPosition1, setCursorPosition1] = useState(0);
  const [isTextAreaFocused1, setIsTextAreaFocused1] = useState(false);
  const [shouldUpdateInnerValue1, setShouldUpdateInnerValue1] = useState(false);
  const [pauseClickCount1, setPauseClickCount1] = useState(0);
  const [pausePosition1, setPausePosition1] = useState(0);

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

  const onPauseButtonClick1 = () => {
    if (value1.trim().length === 0) {
      const newValue = "@[Pause 0.2s](default:0)";
      setValue1(newValue);
      setPausePosition1(newValue.length);
      setCursorPosition1(newValue.length);
    } else {
      const beforeCursor = value1.substring(0, cursorPosition1).trim();
      const afterCursor = value1.substring(cursorPosition1, value1.length).trim();
      setValue1(beforeCursor + "@[Pause 0.2s](default:0)" + afterCursor);

      const prefix = beforeCursor + "@[Pause 0.2s](default:0)";
      setPausePosition1(prefix.length);
      setCursorPosition1(prefix.length);
    }

    setIsTextAreaFocused1(false);
    setPauseClickCount1(pauseClickCount1 + 1);
  };

  return (
    <div className="main">
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
        cursorPosition={cursorPosition}
      />
      <div
        className="pause-button"
        onClick={onPauseButtonClick}
      >
        Pause
      </div>
      {/* <TextArea
        value={value1}
        setValue={setValue1}
        setAudioText={setAudioText1}
        setCursorPosition={setCursorPosition1}
        isEditingMiddle={isTextAreaFocused1}
        setIsEditingMiddle={setIsTextAreaFocused1}
        setShouldUpdateInnerValue={setShouldUpdateInnerValue1}
        shouldUpdateInnerValue={shouldUpdateInnerValue1}
        pauseClickCount={pauseClickCount1}
        cursorPosition={cursorPosition1}
      />
      <div
        className="pause-button"
        onClick={onPauseButtonClick1}
      >
        Pause 1
      </div> */}
    </div>
  );
};

export default App;