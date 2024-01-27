import { Map } from 'immutable';

export const HeadingSpan = (props) => {
  return <span className='text-4xl font-semibold'>{props.children}</span>;
};

export const BoldSpan = (props) => {
  console.log(props.children);
  return <span style={{ fontWeight: 'bold' }}>{props.children}</span>;
};

export const RedSpan = (props) => {
  return <span style={{ color: 'red' }}>{props.children}</span>;
};

export const UnderLineSpan = (props) => {
  return <span style={{ textDecoration: 'underline' }}>{props.children}</span>;
};


export const blockRenderMap = Map({
  'header-span': {
    element: 'span',
    wrapper: <HeadingSpan />,
  },
  'underline-span': {
    element: 'span',
    wrapper: <UnderLineSpan />,
  },
  'bold-span': {
    element: 'span',
    wrapper: <BoldSpan />,
  },
  'red-span': {
    element: 'span',
    wrapper: <RedSpan />,
  },
  'unstyled-span': {
    element: 'span',
    wrapper: <RedSpan />,
  },
});