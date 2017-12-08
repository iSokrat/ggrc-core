/*
 Copyright (C) 2018 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

/**
 * A validation state is a plain object which contains fields set
 * with help a pushed by client the validation actions.
 * @typedef {Object} ValidationState
 *
 * A validation action is a function which should return a new object with the
 * changes for validation state.
 * @typedef {function} ValidationAction
 *
 * An injection is a plain object which contains data necessary for
 * validation actions.
 * @typedef {Object} Injection
 */

/**
 * @class
 * @classdesc
 * Provides ability to generate state dependig on validation actions and
 * injected data.
 *
 * @see {@link ValidationState}
 * @example <caption>Example of state object</caption>
 * {
 *    isEmpty: true,
 *    isValid: false,
 *    hasMissingData: true,
 *    isString: false,
 * }
 *
 * @see {@link ValidationAction}
 * @example <caption>Example of simple validation action</caption>
 * // Old state
 * // {
 * //    isEmpty: true
 * // }
 * const text = 'Opa opa opa-pa!';
 * // Generate state updates
 * const action = () => {
 *  const isEmpty = text.length === 0;
 *  const isString = typeof text === 'string';
 *
 *  return {isEmpty, isString}
 * };
 * validator.validate();
 * // After validation a new state has form:
 * // {
 * //   isEmpty: false,
 * //   isString: true,
 * // }
 *
 * @see {@link Injection}
 * @example <caption>Example of injection</caption>
 * const injection = {
 *    id: 2,
 *    email: 'hello@google.com',
 *    description: 'Awesome boy',
 * };
 * // The injection is passed in each validation action
 * const hasEmptyEmail = ({email}) => ({
 *    hasEmptyEmail: email.length > 6,
 * });
 * const hasEmptyDescription = ({description}) => ({
 *    hasEmptyDescription: description.length !== 0,
 * });
 * const logValidation = (inj) => {
 *  console.log(inj.id);
 *  console.log(inj.email);
 *  console.log(inj.description);
 * }
 */
export default class StateValidator {
  /**
   * Creates instance of state validator.
   * @param {Injection} [initInjection={}] - Initial injection object.
   * @param {ValidationState} [initState={}] - Initial state.
   * @example
   * // setup initial state
   * const initState = {
   *    hasEmptyName: false,
   * }
   * // setup initial injection
   * const initInjection = {
   *    user: {name: 'Valerio'},
   * }
   * // creates validator
   * const validator = new StateValidator(initInjection, initState);
   */
  constructor(initInjection = {}, initState = {}) {
    /**
     * {@link ValidationState}
     * @private
     */
    this._validationState = initState;

    /**
     * {@link Injection}
     * @private
     */
    this._injected = initInjection;

    /**
     * Array of validation actions.
     * {@link ValidationAction}
     * @private
     */
    this._validationActions = [];
  }

  /**
   * Adds [validation actions]{@link ValidationAction} to validator.
   * @param {...ValidationAction} actions - A set of {@link ValidationAction}.
   * @example
   * // validation actions
   * const action1 = () => ({a: 1});
   * const action2 = () => ({b: 2});
   * const action3 = () => ({c: 3});
   * // adds actions to validator
   * validator.addValidationActions(action1, action2, action3);
   */
  addValidationActions(...actions) {
    this._validationActions.push(...actions);
  }

  /**
   * Updates current validator [injection]{@link Injection} with new data.
   * Note: If is updated some field which is Object then it will be overwritten.
   * @param {Injection} injection - A new [injection object]{@link Injection}.
   * @example
   * // Old injection
   * // {
   * //   text: 'Abc',
   * //   config: {
   * //     temperature: 0,
   * //   },
   * // }
   * // setup injection
   * const newInjection = {
   *  number: 2,
   *  config: {
   *    speed: 2
   *  }
   * }
   * validator.updateInjection(newInjection);
   * // New state
   * // {
   * //   number: 2
   * //   text: 'Abc',
   * //   config: {
   * //     speed: 2,
   * //   },
   * // }
   */
  updateInjection(injection) {
    let injected = this._injected;
    Object.assign(injected, injection);
  }

  /**
   * Calls all validation [actions]{@link ValidationAction} with passed
   * [injections]{@link Injection} for updating inner validation state.
   */
  validate() {
    const validateActions = this._validationActions;
    const injected = this._injected;
    const newState = validateActions
      .reduce((state, action) => {
        const actionState = action(injected);
        return Object.assign(state, actionState);
      }, {});

    Object.assign(
      this._validationState,
      newState
    );
  }

  /**
   * Returns current validation state.
   * @return {ValidationState} - Current validation state.
   */
  get validationState() {
    return this._validationState;
  }
}
