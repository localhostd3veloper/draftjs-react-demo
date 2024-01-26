import React, { useState, useRef } from 'react';
import { Editor, EditorState, ContentState, CompositeDecorator, convertToRaw, getDefaultKeyBinding } from 'draft-js';

const HeadingDecorator = {
  strategy: (contentBlock, callback) => {
    const text = contentBlock.getText();
    if (text.startsWith('# ')) {
      callback(0, 2);
    }
  },
  component: props => (
    <h1 style={{ color: 'blue' }}>
      {props.children}
    </h1>
  ),
};

const compositeDecorator = new CompositeDecorator([HeadingDecorator]);

const EditorWithHeading = () => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty(compositeDecorator)
  );

  const editorRef = useRef(null);

  const onChange = editorState => {
    setEditorState(editorState);
  };

  const handleBeforeInput = (chars, editorState) => {
    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const currentBlock = currentContent.getBlockForKey(selection.getStartKey());
    const text = currentBlock.getText();

    if (chars === '#' && selection.getStartOffset() === 0 && text === '') {
      // If the user types '#' at the beginning of the line, change the block type
      const newContentState = ContentState.createFromText(' ');
      const newEditorState = EditorState.push(editorState, newContentState, 'change-block-type');
      setEditorState(newEditorState);
      return 'handled';
    }

    return 'not-handled';
  };

  const keyBindingFn = (e) => {
    if (e.key === 'Enter') {
      const contentState = editorState.getCurrentContent();
      const selectionState = editorState.getSelection();
      const currentBlock = contentState.getBlockForKey(selectionState.getStartKey());
      const text = currentBlock.getText();

      if (text.startsWith('# ')) {
        // If the user presses Enter after typing '# ', change the block type
        const newContentState = ContentState.createFromText(' ');
        const newEditorState = EditorState.push(editorState, newContentState, 'change-block-type');
        setEditorState(newEditorState);
        return 'handled';
      }
    }

    return getDefaultKeyBinding(e);
  };

  return (
    <div>
      <Editor
        editorState={editorState}
        onChange={onChange}
        handleBeforeInput={handleBeforeInput}
        keyBindingFn={keyBindingFn}
        ref={editorRef}
      />
      <div>
        <h2>Current Content State:</h2>
        <pre>{JSON.stringify(convertToRaw(editorState.getCurrentContent()), null, 2)}</pre>
      </div>
    </div>
  );
};

export default EditorWithHeading;
