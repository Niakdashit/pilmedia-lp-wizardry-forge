// @ts-nocheck
// Redux hooks for TemplatedQuiz component

import { useDispatch } from 'react-redux';

// App dispatch hook
export const useAppDispatch = () => {
  const dispatch = useDispatch();
  return dispatch;
};
