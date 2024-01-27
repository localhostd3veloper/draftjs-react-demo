import { useState } from 'react';
import { useEffect } from 'react';
import {
  Editor,
  EditorState,
  convertFromRaw,
  convertToRaw,
  getDefaultKeyBinding,
  Modifier,
} from 'draft-js';
import 'draft-js/dist/Draft.css';
import { blockRenderMap } from './components/Extended';
import { DefaultDraftBlockRenderMap } from 'draft-js';

export default function App() {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  // Extend the blockRenderMap
  const extendedBlockRenderMap =
    DefaultDraftBlockRenderMap.merge(blockRenderMap);

  const handleChange = (newEditorState) => {
    setEditorState(newEditorState);
    setEditorState(EditorState.moveFocusToEnd(newEditorState));
  };

  const handleSave = () => {
    const contentState = editorState.getCurrentContent();
    localStorage.setItem(
      'editorContent',
      JSON.stringify(convertToRaw(contentState))
    );
  };

  useEffect(() => {
    const savedContent = localStorage.getItem('editorContent');
    if (savedContent) {
      const contentState = convertFromRaw(JSON.parse(savedContent));
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, []);

  const handleBeforeInput = (chars, editorState) => {
    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const currentBlock = currentContent.getBlockForKey(selection.getStartKey());

    const text = currentBlock.getText();

    /**
     * Set the type of the editor at the specified offset with the provided component.
     *
     * @param {number} offset - the offset where to set the editor type
     * @param {string} component - the component to set as the editor type
     * @return {string} 'handled' indicating the function has completed
     */
    function setEditorType(offset, component) {
      const newContentState = Modifier.replaceText(
        currentContent,
        selection.merge({
          anchorOffset: selection.getAnchorOffset() - offset,
          focusOffset: selection.getFocusOffset(),
        })
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
        component
      );
      const newHeaderEditorState = EditorState.push(
        editorState,
        newHeaderContentState,
        'change-block-type'
      );
      setEditorState(newHeaderEditorState);
      return 'handled';
    }

    if (chars === ' ') {
      switch (text) {
        case '#':
          return setEditorType(1, 'header-span');
        case '*':
          return setEditorType(1, 'bold-span');
        case '**':
          return setEditorType(2, 'red-span');
        case '***':
          return setEditorType(3, 'underline-span');
        default:
          return 'not-handled';
      }
    }
    return 'not-handled';
  };

  return (
    <div className='h-dvh bg-gray-100 text-xl gap-3 p-5 md:p-28 flex flex-col justify-center items-center'>
      <div className='flex w-full justify-between'>
        <div className='text-center font-semibold'>
          Demo editor by Gautam Anand
        </div>
        <button
          onClick={handleSave}
          className='bg-white hover:shadow-lg duration-300 text-slate-700 px-3 py-1 rounded-md border-2 border-gray-600'
        >
          Save
        </button>
      </div>
      <div className='shadow rounded-lg bg-gray-50 h-full w-full p-5 overflow-y-auto'>
        <Editor
          editorState={editorState}
          onChange={handleChange}
          handleBeforeInput={(chars) => handleBeforeInput(chars, editorState)}
          blockRenderMap={extendedBlockRenderMap}
        />
      </div>
    </div>
  );
}
