import { useState } from 'react';
import { useEffect } from 'react';
import {
  Editor,
  EditorState,
  CompositeDecorator,
  ContentState,
  convertFromRaw,
  convertToRaw,
  getDefaultKeyBinding,
  Modifier,
} from 'draft-js';
import 'draft-js/dist/Draft.css';

export default function App() {
  const headingStrategy = (contentBlock, callback) => {
    const text = contentBlock.getText();
    if (text.startsWith('# ')) {
      callback(0, 2);
    }
  };

  const boldStrategy = (contentBlock, callback) => {
    const text = contentBlock.getText();
    if (text.startsWith('* ')) {
      callback(0, 2);
    }
  };

  const makeItRedStrategy = (contentBlock, callback) => {
    const text = contentBlock.getText();
    if (text.startsWith('** ')) {
      callback(0, 3);
    }
  };

  const underLineStrategy = (contentBlock, callback) => {
    const text = contentBlock.getText();
    if (text.startsWith('*** ')) {
      callback(0, 4);
    }
  };

  const HeadingSpan = (props) => {
    return <span className='text-2xl font-semibold'>{props.children}</span>;
  };

  const BoldSpan = (props) => {
    console.log(props.children);
    return <span style={{ fontWeight: 'bold' }}>{props.children}</span>;
  };

  const RedSpan = (props) => {
    return <span style={{ color: 'red' }}>{props.children}</span>;
  };

  const UnderLineSpan = (props) => {
    return (
      <span style={{ textDecoration: 'underline' }}>{props.children}</span>
    );
  };

  const handleChange = (newEditorState = editorState) => {
    setEditorState(newEditorState);
    console.log(convertToRaw(newEditorState.getCurrentContent()));
  };

  const handleSave = () => {
    const contentState = editorState.getCurrentContent();
    localStorage.setItem(
      'editorContent',
      JSON.stringify(convertToRaw(contentState))
    );
  };

  const compositeDecorator = new CompositeDecorator([
    // {
    //   strategy: headingStrategy,
    //   component: HeadingSpan,
    // },
    {
      strategy: boldStrategy,
      component: BoldSpan,
    },
    {
      strategy: makeItRedStrategy,
      component: RedSpan,
    },
    {
      strategy: underLineStrategy,
      component: UnderLineSpan,
    },
  ]);

  const [editorState, setEditorState] = useState(
    EditorState.createEmpty(compositeDecorator)
  );

  useEffect(() => {
    // Example of loading existing content from storage
    const savedContent = localStorage.getItem('editorContent');
    if (savedContent) {
      const contentState = convertFromRaw(JSON.parse(savedContent));
      setEditorState(
        EditorState.createWithContent(contentState, compositeDecorator)
      );
    }
  }, []);

  const handleBeforeInput = (
    chars = '',
    editorState = EditorState.createEmpty()
  ) => {
    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const currentBlock = currentContent.getBlockForKey(selection.getStartKey());
    const text = currentBlock.getText();
    console.log({
      chars,
      text,
      selection: selection.getStartOffset(),
      startsWith: text.startsWith('# '),
    });

    // if the first character is '#' and a space then remove the #, also make it header-one
    if (text === '#' && chars === ' ') {
      // Remove the #
      const newContentState = Modifier.replaceText(
        currentContent,
        selection.merge({
          anchorOffset: selection.getStartOffset() - 2,
          focusOffset: selection.getStartOffset(),
        }),
        ''
      );
      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        'change-block-data'
      );
      setEditorState(newEditorState);
      const newHeaderContentState = Modifier.setBlockType(
        newContentState,
        selection,
        'bold'
      );
      const newHeaderEditorState = EditorState.push(
        editorState,
        newHeaderContentState,
        'change-block-type'
      );
      setEditorState(newHeaderEditorState);
      return 'handled';
    }

    if(text==='*' && chars === ' '){
      const newContentState = Modifier.replaceText(
        currentContent,
        selection.merge({
          anchorOffset: selection.getStartOffset() - 2,
          focusOffset: selection.getStartOffset(),
        }),
        ''
      );

      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        'change-block-data'
      );
      setEditorState(newEditorState);
    }
    return 'not-handled';
  };

  const keyBindingFn = (e) => {
    // reset the next block to unstyled

    if (e.key === 'Enter') {
      console.log('Here');

      // const nextLineContentState = Modifier.setBlockType(editorState.getCurrentContent(), editorState.getSelection(), 'unstyled')
      // const updatedEditorState = EditorState.push(editorState, nextLineContentState, 'change-block-type')
      const newContentState = Modifier.setBlockType(
        editorState.getCurrentContent(),
        editorState.getSelection(),
        'unstyled'
      );
      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        'change-block-type'
      );
      setEditorState(newEditorState);
    }
    return getDefaultKeyBinding(e);
  };

  return (
    <div className='h-dvh bg-gray-100 text-xl gap-3 p-5 md:p-28 flex flex-col justify-center items-center'>
      <div className='flex w-full justify-between'>
        <div className='text-center font-semibold'>
          Demo editor by Gautam Anand
        </div>
        <button
          onClick={handleSave}
          className='bg-slate-800 hover:shadow-lg self-end hover:scale-105 duration-300 text-white p-2 rounded-lg'
        >
          Save
        </button>
      </div>
      <div className='shadow rounded-lg bg-gray-50 h-full w-full p-5'>
        <Editor
          editorState={editorState}
          onChange={handleChange}
          handleBeforeInput={(chars) => handleBeforeInput(chars, editorState)}
          keyBindingFn={keyBindingFn}
        />
      </div>
    </div>
  );
}
