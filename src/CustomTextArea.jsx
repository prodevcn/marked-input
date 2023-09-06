import React, { useCallback, useEffect, useRef, useState } from "react";
import { MarkedInput, useMark } from "rc-marked-input";

const CustomTextArea = (props) => {
  const {
    value,
    setValue,
    setAudioText,
    setCursorPosition,
    shouldUpdateInnerValue,
    setShouldUpdateInnerValue,
    isEditingMiddle,
    setIsEditingMiddle,
    // pausePosition,
    pauseClickCount,
    cursorPosition,
  } = props;

  const inputRef = useRef(null);
  const [isAllSelected, setAllSelected] = useState(false);
  const [isTextSelected, setTextSelected] = useState(false);
  const [startPosition, setStartPosition] = useState(null);
  const [endPosition, setEndPosition] = useState(null);

  const checkApple = () => {
    const expression = /(Mac|iPhone|iPod|iPad)/i;
    return expression.test(navigator.userAgent);
  };

  const getCaretCharacterOffsetWithin = (element) => {
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;

    if (typeof win.getSelection !== "undefined") {
      sel = win.getSelection();

      if (sel.rangeCount > 0) {
        var range = win.getSelection().getRangeAt(0);
        var preCaretRange = range.cloneRange();

        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;
      }
    } else if ((sel = doc.selection) && sel.type !== "Control") {
      var textRange = sel.createRange();
      var preCaretTextRange = doc.body.createTextRange();

      preCaretTextRange.moveToElementText(element);
      preCaretTextRange.setEndPoint("EndToEnd", textRange);
      caretOffset = preCaretTextRange.text.length;
    }

    return caretOffset;
  };

  const findLastEditablePosition = (originalText, updatedText) => {
    // Deleted a character
    if (updatedText.length < originalText.length) {
      for (let i = 0; i < originalText.length; i++) {
        if (updatedText[i] !== originalText[i]) {
          return i;
        }
      }
      // Added a character
    } else if (originalText.length < updatedText.length) {
      for (let i = 0; i < updatedText.length; i++) {
        if (updatedText[i] !== originalText[i]) {
          // console.log(updatedText[i], originalText[i]);
          return i + 1;
        }
      }
    } else {
      return originalText.length + 1;
    }
  };

  const putCursorAtMiddle = useCallback(() => {
    console.log("[input_ref]:[set_cursor_middle]");

    if (!inputRef.current) return;

    setTimeout(() => {
      // setCursorPosition(cursorPosition);
      inputRef.current.focus();

      const container = inputRef.current.container;
      const spanElements = container.querySelectorAll(".mk-input span");
      // const pauseTags = value.substring(0, pausePosition).match(/Pause 0.2s/g);
      const pauseTags = value.substring(0, cursorPosition).match(/Pause 0.2s/g);
      const countOfPause = pauseTags.length;

      let count = 0;
      let nth = 0;

      for (let i = 0; i <= spanElements.length - 1; i++) {
        if (spanElements[i].firstChild === null) continue;

        if (spanElements[i].firstChild.nodeValue.includes("\u00D7")) {
          count += 1;
        }

        if (count === countOfPause) {
          nth = i;
          break;
        }
      }

      const nextNode = spanElements[nth + 1].firstChild;

      if (nextNode === null) {
        spanElements[nth + 1].focus();
        return;
      }

      var range = document.createRange();
      range.setStart(nextNode, 0);
      range.setEnd(nextNode, 0);

      var selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }, [500]);
  }, [cursorPosition, value]);

  const putCursorAtEndOfDiv = () => {
    console.log("[cursor]:[put_end]");
    if (!inputRef.current) return;

    setTimeout(() => {
      const container = inputRef.current.container;
      const spanElements = container.querySelectorAll(".mk-input span");

      var finalSpan = spanElements[spanElements.length - 1];

      if (finalSpan === null || finalSpan === undefined) return;

      var textNode = finalSpan.firstChild;

      if (textNode === null) {
        finalSpan.focus();
        return;
      }

      var range = document.createRange();
      range.setStart(textNode, textNode.length);
      range.setEnd(textNode, textNode.length);

      var selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      setCursorPosition(value.length);
    }, 500);
  };

  const onChange = (text) => {
    const position = findLastEditablePosition(value, text);
    setCursorPosition(position);
    setValue(text);
  };

  const RemovableMark = () => {
    const { label, remove } = useMark();
    return (
      <mark
        style={{
          display: "inline-flex",
          width: "fit-content",
          background: "#22262F",
          color: "white",
          border: "1px solid #626A73",
          boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.05)",
          borderRadius: "8px",
          padding: "2px 10px",
          marginLeft: "2px",
          marginRight: "2px",
          gap: "10px",
          cursor: "pointer",
          textAlign: "left",
          fontStyle: "normal",
          fontWeight: 400,
          fontSize: "16px",
          lineHeight: "24px",
          float: "none",
        }}
      >
        {label}
        <span
          style={{
            fontSize: "24px",
            textAlign: "center",
          }}
          onClick={() => {
            remove();
            setIsEditingMiddle(false);
          }}
        >
          &times;
        </span>
      </mark>
    );
  };

  /** event listeners */
  const clickListener = useCallback(
    (event) => {
      console.log("[input_ref]:[event]:[click]");

      // if (isTextSelected && startPosition !== 0 && endPosition !== 0) {
      //   console.log("[prevent]:[click]");
      //   return;
      // }

      const span = event.target;
      const text = span.innerText;
      const position = getCaretCharacterOffsetWithin(span);
      const index = value.indexOf(text);
      const isEnd = span.className === "mk-input";

      if (index < 0 || isEnd) {
        setCursorPosition(value.length + 1);
        return;
      }

      setCursorPosition(index + position);
      setIsEditingMiddle(true);
    },
    [
      value,
      setCursorPosition,
      setIsEditingMiddle,
      // isTextSelected,
      // startPosition,
      // endPosition,
    ]
  );

  const keyDownListener = useCallback(
    (event) => {
      console.log("[event]:[key_down]");

      if (event.ctrlKey && event.key === "a") {
        console.log("[event]:[key_ctrl_a]");

        // event.preventDefault();
        const container = inputRef.current.container;
        const spanElements = container.querySelectorAll(".mk-input span");

        if (spanElements.length === 1 && spanElements[0].firstChild === null)
          return;

        const startNode =
          spanElements[0].firstChild ?? spanElements[1].firstChild;
        const endNode =
          spanElements[spanElements.length - 1].firstChild ??
          spanElements[spanElements.length - 2].firstChild;

        const range = document.createRange();
        range.setStart(startNode, 0);
        range.setEnd(endNode, 1);

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        setAllSelected(true);
      } else if (event.ctrlKey && event.key === "c") {
        event.preventDefault();
        if (isTextSelected && startPosition !== 0 && endPosition !== 0) {
          navigator.clipboard.writeText(
            value.slice(startPosition, endPosition + 1)
          );
        } else if (isAllSelected) {
          navigator.clipboard.writeText(value);
        }
      } else if (event.ctrlKey && event.key === "x") {
        event.preventDefault();
        if (isAllSelected) {
          navigator.clipboard.writeText(value);
          setValue("");
          setAllSelected(false);
        } else if (isTextSelected && startPosition !== 0 && endPosition !== 0) {
          navigator.clipboard.writeText(
            value.slice(startPosition, endPosition + 1)
          );
          setValue(value.slice(0, startPosition) + value.slice(endPosition));
          setTextSelected(false);
          setStartPosition(0);
          setEndPosition(0);
        }
      } else if (checkApple() && event.metaKey && event.key === "a") {
        console.log("[event]:[cmd + a]");

        event.preventDefault();
        const container = inputRef.current.container;
        const spanElements = container.querySelectorAll(".mk-input span");

        if (spanElements.length === 1 && spanElements[0].firstChild === null)
          return;

        const startNode = spanElements[0].firstChild;
        const endNode = spanElements[spanElements.length - 1].firstChild;

        const range = document.createRange();
        range.setStart(startNode, 0);
        range.setEnd(endNode, endNode.length);

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        setAllSelected(true);
      } else if (checkApple() && event.metaKey && event.key === "c") {
        event.preventDefault();
        if (isTextSelected && startPosition !== 0 && endPosition !== 0) {
          navigator.clipboard.writeText(
            value.slice(startPosition, endPosition + 1)
          );
        } else if (isAllSelected) {
          navigator.clipboard.writeText(value);
        }
      } else if (checkApple() && event.metaKey && event.key === "x") {
        event.preventDefault();
        if (isAllSelected) {
          navigator.clipboard.writeText(value);
          setValue("");
          setAllSelected(false);
        } else if (isTextSelected && startPosition !== 0 && endPosition !== 0) {
          navigator.clipboard.writeText(
            value.slice(startPosition, endPosition + 1)
          );
          setValue(value.slice(0, startPosition) + value.slice(endPosition));
          setTextSelected(false);
          setStartPosition(0);
          setEndPosition(0);
        }
      } else if (event.key === "Delete") {
        console.log("[event]:[key_down]:[delete]");
        console.log("[select_all_text]:", isAllSelected);
        if (isAllSelected) {
          console.log("[selected_all_text]");

          event.preventDefault();
          setValue("");
          setAllSelected(false);
        } else if (isTextSelected && startPosition && endPosition) {
          event.preventDefault();
          setValue(value.slice(0, startPosition) + value.slice(endPosition));
          setTextSelected(false);
          setStartPosition(null);
          setEndPosition(null);
        } else {
          console.log("[event]:[text_is_not_selected]");
        }
      } else if (event.key === "Backspace") {
        if (isAllSelected) {
          console.log("[selected_all_text]");
          event.preventDefault();
          setValue("");
          setAllSelected(false);
        } else if (isTextSelected && startPosition && endPosition) {
          event.preventDefault();
          setValue(value.slice(0, startPosition) + value.slice(endPosition));
          setTextSelected(false);
          setStartPosition(null);
          setEndPosition(null);
        } else {
          console.log("[event]:[text_is_not_selected]");
        }
      }
    },
    [
      value,
      endPosition,
      startPosition,
      setValue,
      isAllSelected,
      setAllSelected,
      isTextSelected,
    ]
  );

  const keyUpListener = useCallback(
    (event) => {
      console.log("[input_ref]:[event]:[key_up]");

      if (
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight"
      ) {
        const span = event.target;
        const text = span.innerText;
        const position = getCaretCharacterOffsetWithin(span);
        const index = value.indexOf(text);
        const isEnd = span.className === "mk-input";

        if (index < 0 || isEnd) {
          setCursorPosition(value.length + 1);
          return;
        }

        setCursorPosition(index + position);
        setIsEditingMiddle(true);
      }
    },
    [setIsEditingMiddle, setCursorPosition, value]
  );

  const mouseListener = () => {
    console.log("[input_ref]:[event]:[mouse_down]");

    const container = inputRef.current.container;
    let startCursorPosition = 0;
    let endCursorPosition = 0;

    const handleMouseMove = () => {
      console.log("[event]:[mouse_move]");
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const spanElements = container.querySelectorAll(".mk-input span");

      let startContainerPosition;
      let endContainerPosition;

      spanElements.forEach((el, index) => {
        if (el.firstChild === range.startContainer)
          startContainerPosition = index;
        if (el.firstChild === range.endContainer) endContainerPosition = index;
      });

      if (startContainerPosition === 0) startCursorPosition = range.startOffset;
      else {
        let tmp = "";

        for (let i = 0; i < startContainerPosition; i++) {
          if (spanElements[i].firstChild.nodeValue) {
            if (spanElements[i].firstChild.nodeValue.includes("\u00D7")) {
              tmp += "@[Pause 0.2s](default:0)";
            } else {
              tmp += spanElements[i].firstChild.nodeValue;
            }
          }
        }

        startCursorPosition = tmp.length + range.startOffset;
      }

      let tmp = "";

      for (let i = 0; i < endContainerPosition; i++) {
        if (spanElements[i].firstChild.nodeValue) {
          if (spanElements[i].firstChild.nodeValue.includes("\u00D7")) {
            tmp += "@[Pause 0.2s](default:0)";
          } else {
            tmp += spanElements[i].firstChild.nodeValue;
          }
        }
      }

      endCursorPosition = tmp.length + range.endOffset;
    };

    const handleMouseUp = () => {
      console.log("[event]:[mouse_up]");
      setTextSelected(true);
      setStartPosition(startCursorPosition);
      setEndPosition(endCursorPosition);

      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseup", handleMouseUp);
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseup", handleMouseUp);
  };

  /** add click listener */
  useEffect(() => {
    if (!inputRef.current) return;

    const container = inputRef.current.container;
    container.addEventListener("click", clickListener);

    return () => {
      container.removeEventListener("click", clickListener);
    };
  }, [clickListener]);

  // /** add keydown listener */
  useEffect(() => {
    if (!inputRef.current) return;

    const container = inputRef.current.container;
    container.addEventListener("keydown", keyDownListener);

    return () => {
      container.removeEventListener("keydown", keyDownListener);
    };
  }, [keyDownListener]);

  /** add keyup listener */
  useEffect(() => {
    if (!inputRef.current) return;

    const container = inputRef.current.container;
    container.addEventListener("keyup", keyUpListener);

    return () => {
      container.removeEventListener("keyup", keyUpListener);
    };
  }, [keyUpListener]);

  // /** add mouse down listener */
  // useEffect(() => {
  //   if (!inputRef.current) return;

  //   const container = inputRef.current.container;
  //   container.addEventListener("mousedown", mouseListener);

  //   return () => {
  //     container.removeEventListener("mousedown", mouseListener);
  //   };
  // }, [inputRef, value]);

  useEffect(() => {
    if (cursorPosition === value.length) putCursorAtEndOfDiv();
    else putCursorAtMiddle();
  }, [pauseClickCount]);

  useEffect(() => {
    console.log("[***** I am not sure why this method is needed *****]");
    if (!shouldUpdateInnerValue) return;
    if (!inputRef.current) return;

    const container = inputRef.current.container;
    const spanElement = container.querySelector(".mk-input span");

    // Update the value of the span element
    spanElement.textContent = value;
    setShouldUpdateInnerValue(false);
  }, [shouldUpdateInnerValue]);

  useEffect(() => {
    setAudioText(
      value.replaceAll("@[Pause 0.2s](default:0)", '<break time="200ms"/>')
    );
  }, [value, setAudioText]);

  return (
    <>
      <div style={{ marginBottom: "3rem" }}>
        <h4>✏️ Is_Editing_Middle: {isEditingMiddle ? "true" : "false"}</h4>
        <h4>📉 All Selected: {isAllSelected ? "true" : "false"}</h4>
        <h4>📖 Text selected: {isTextSelected ? "true" : "false"}</h4>
        <h4>📌 Start position: {startPosition}</h4>
        <h4>📌 position: {endPosition}</h4>
      </div>
      <div
        style={{
          fontFamily: "'Poppins'",
          width: "100%",
          color: "white",
          height: 183,
          padding: "12.5px 12px 30px 12px",
          background: "#22262F",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "8px",
          boxSizing: "border-box",
          margin: "16px auto",
          marginBottom: 1,
          marginTop: 27.5,
          overflowY: "auto",
          lineHeight: 1.44,
          textAlign: "left",
          cursor: "text",
        }}
        onClick={() => {
          console.log("[custom_textarea]:[event]:[click]");

          if (isEditingMiddle) {
            console.log("[edit_middle_text]");
            return;
          }

          if (value.trim().length === 0) {
            console.log("value is null");
            inputRef.current.focus();
            return;
          }

          putCursorAtEndOfDiv();
        }}
      >
        <MarkedInput
          ref={inputRef}
          Mark={RemovableMark}
          value={value}
          onChange={(e) => {
            onChange(e);
          }}
        />
      </div>
    </>
  );
};

export default CustomTextArea;
