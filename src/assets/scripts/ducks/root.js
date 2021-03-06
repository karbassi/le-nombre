import { batchActions } from 'redux-batched-actions';
import * as numbers from 'ducks/numbers';
import * as user from 'ducks/user';

export const giveUp = () => user.update({ isGivingUp: true });

export const newGame = () => (dispatch, getState) => {
  const { difficulty, streak } = getState().user;
  const zeroedStreak = { ...streak, [difficulty]: 0 };
  return dispatch(batchActions([
    numbers.newGame(difficulty),
    user.update({ didGiveUp: false, streak: zeroedStreak }),
  ]));
};

export const newRound = () => (dispatch, getState) => {
  const { difficulty } = getState().user;
  return dispatch(numbers.newGame(difficulty));
};

export const setDifficulty = difficulty => (dispatch, getState) => {
  const { inventory } = getState().numbers[difficulty];
  const actions = [ user.update({ difficulty, didGiveUp: false }) ];
  if (!inventory.length || numbers.wasSuccessful(difficulty)(getState().numbers)) {
    actions.push(numbers.newGame(difficulty));
  }
  if (getState().user.didGiveUp) {
    const oldDifficulty = getState().user.difficulty;
    const streak = getState().user.streak;
    actions.push(user.update({ streak: { ...streak, [oldDifficulty]: 0 } }));
    actions.push(numbers.newGame(oldDifficulty));
  }
  return dispatch(batchActions(actions));
};
