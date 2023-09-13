import React, { useCallback, useEffect, useRef, useState } from "react";
import { MarkedInput, useMark } from "rc-marked-input";

const TextArea = (props) => {
  const {
    value,
    setValue,
    setCursorPosition,
    shouldUpdateInnerValue,
    setShouldUpdateInnerValue,
    isEditingMiddle,
    setIsEditingMiddle,
    pauseClickCount,
    cursorPosition,
  } = props;

  const inputRef = useRef(null);
  const [isAllSelected, setAllSelected] = useState(false);
  const [isTextSelected, setTextSelected] = useState(false);
  const [startPosition, setStartPosition] = useState(null);
  const [endPosition, setEndPosition] = useState(null);
  const [mouseDown, setMouseDown] = useState(false);

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
    if (!inputRef.current) return;

    setTimeout(() => {
      // setCursorPosition(cursorPosition);
      inputRef.current.focus();

      const container = inputRef.current.container;
      const spanElements = container.querySelectorAll(".mk-input span");
      const pauseTags = value.substring(0, cursorPosition).match(/Pause 0.2s/g);
      const countOfPause = pauseTags ? pauseTags.length : 0;

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
            console.log("===============================>");
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
    [value, setCursorPosition, setIsEditingMiddle]
  );

  // const mouseListener = useCallback(() => {
  //   console.log("[input_ref]:[event]:[mouse_down]");

  //   const container = inputRef.current.container;

  //   let startCursorPosition = 0;
  //   let endCursorPosition = 0;

  //   const handleMouseMove = () => {
  //     console.log("[event]:[mouse_move]");

  //     const selection = window.getSelection();
  //     const range = selection.getRangeAt(0);
  //     const spanElements = container.querySelectorAll(".mk-input span");

  //     let startContainerPosition;
  //     let endContainerPosition;

  //     spanElements.forEach((el, index) => {
  //       if (el.firstChild === range.startContainer)
  //         startContainerPosition = index;
  //       if (el.firstChild === range.endContainer) endContainerPosition = index;
  //     });

  //     if (startContainerPosition === 0) startCursorPosition = range.startOffset;
  //     else {
  //       let tmp = "";

  //       for (let i = 0; i < startContainerPosition; i++) {
  //         if (
  //           spanElements[i].firstChild &&
  //           spanElements[i].firstChild.nodeValue
  //         ) {
  //           if (spanElements[i].firstChild.nodeValue.includes("\u00D7")) {
  //             tmp += "@[Pause 0.2s](default:0)";
  //           } else {
  //             tmp += spanElements[i].firstChild.nodeValue;
  //           }
  //         }
  //       }

  //       startCursorPosition = tmp.length + range.startOffset;
  //     }

  //     let tmp = "";

  //     for (let i = 0; i < endContainerPosition; i++) {
  //       if (
  //         spanElements[i].firstChild &&
  //         spanElements[i].firstChild.nodeValue
  //       ) {
  //         if (spanElements[i].firstChild.nodeValue.includes("\u00D7")) {
  //           tmp += "@[Pause 0.2s](default:0)";
  //         } else {
  //           tmp += spanElements[i].firstChild.nodeValue;
  //         }
  //       }
  //     }

  //     endCursorPosition = tmp.length + range.endOffset;
  //   };

  //   const handleMouseUp = () => {
  //     console.log("[event]:[mouse_up]");

  //     console.log("[selection]:[start]:", startCursorPosition);
  //     console.log("[selection]:[end]:", endCursorPosition);

  //     setTextSelected(true);
  //     setStartPosition(startCursorPosition);
  //     setEndPosition(endCursorPosition);

  //     container.removeEventListener("mousemove", handleMouseMove);
  //     container.removeEventListener("mouseup", handleMouseUp);
  //   };

  //   container.addEventListener("mousemove", handleMouseMove);
  //   container.addEventListener("mouseup", handleMouseUp);
  // }, []);

  const handleMouseDown = (event) => {
    setMouseDown(true);
    const target = event.target;
    if (target.classList.contains("editable-span")) {
      target.focus();
      target.classList.add("selecting");
    } else if (target.classList.contains("mark-component")) {
      target.classList.add("selecting");
    }
  };

  const handleMouseMove = (event) => {
    if (mouseDown) {
      const selection = window.getSelection();
      selection.removeAllRanges();

      const range = document.createRange();
      range.setStart(event.target, 0);
      range.setEnd(event.target, event.target.childNodes.length);
      selection.addRange(range);
    }
  };

  const handleMouseUp = () => {
    setMouseDown(false);

    const selection = window.getSelection().toString();
    console.log(`Selected text: ${selection}`);

    const selectedElements = document.querySelectorAll(".selecting");
    selectedElements.forEach((element) => {
      element.classList.remove("selecting");
    });
  };

  /** add mouse down listener */
  useEffect(() => {
    if (!inputRef.current) return;

    const container = inputRef.current.container;

    container.addEventListener("mousedown", handleMouseDown);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseup", handleMouseUp);

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  /** add click listener */
  useEffect(() => {
    if (!inputRef.current) return;

    const container = inputRef.current.container;
    container.addEventListener("click", clickListener);

    return () => {
      container.removeEventListener("click", clickListener);
    };
  }, [clickListener]);

  useEffect(() => {
    if (cursorPosition === value.length) putCursorAtEndOfDiv();
    else putCursorAtMiddle();
  }, [pauseClickCount]);

  useEffect(() => {
    if (!shouldUpdateInnerValue) return;
    if (!inputRef.current) return;

    const container = inputRef.current.container;
    const spanElement = container.querySelector(".mk-input span");

    // Update the value of the span element
    spanElement.textContent = value;
    setShouldUpdateInnerValue(false);
  }, [shouldUpdateInnerValue, setShouldUpdateInnerValue, value]);

  return (
    <>
      <div style={{ marginBottom: "3rem" }}>
        <h4>
          [ ✏️ ] : [ is_editing_middle ] : {isEditingMiddle ? "true" : "false"}
        </h4>
        <h4>
          [ 📉 ] : [ is_all_selected ] : {isAllSelected ? "true" : "false"}
        </h4>
        <h4>
          [ 📖 ] : [ is_text_selected ] : {isTextSelected ? "true" : "false"}
        </h4>
        <h4>[ 📌 ] : [ start_position ] : {startPosition}</h4>
        <h4>[ 📌 ] : [ end_position ] : {endPosition}</h4>
      </div>
      <div
        style={{
          fontFamily: "'Poppins'",
          color: "white",
          height: 183,
          padding: "12.5px 12px 30px 12px",
          background: "#22262F",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "8px",
          margin: "16px auto",
          marginBottom: 1,
          marginTop: 27.5,
          overflowY: "auto",
          lineHeight: 1.44,
          textAlign: "left",
          cursor: "text",
        }}
        onClick={() => {
          console.log("[div]:[event]:[on_click]");

          if (isEditingMiddle) {
            setAllSelected(false);
            return;
          }

          if (value.trim().length === 0) {
            inputRef.current.focus();
            setAllSelected(false);
            return;
          }

          if (isTextSelected && startPosition !== 0 && endPosition !== 0)
            return;

          putCursorAtEndOfDiv();
          setAllSelected(false);
        }}
      >
        <MarkedInput
          ref={inputRef}
          Mark={RemovableMark}
          value={value}
          onChange={onChange}
        />
      </div>
    </>
  );
};

export default TextArea;
