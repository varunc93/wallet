import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {startAddExpense, addExpense, removeExpense, startRemoveExpense, editExpense, startEditExpense, setExpenses, startSetExpenses } from "../../actions/expenses";
import expenses from "../fixtures/expenses";
import database from '../../firebase/firebase';

const createMockStore = configureMockStore([thunk]);

beforeEach(() => {
    const expensesData = {};
    expenses.forEach(({id, description, text, amount, createdAt}) => {
        expenses[id] = {description, note, amount, createdAt};
    });
    database.ref('expenses').set(expensesData).then(() => done());
});

test("should setup remove expense object", () => {
    const action = removeExpense({id: '123abc'});
    expect(action).toEqual({
        type: "REMOVE_EXPENSE",
        id: '123abc'
    }); //toBe uses === to compare and that will fail for objects
});


test("should remove expense from firebase", (done) => {
    const store = createMockStore({});
    const id = expenses[2].id;
    store.dispatch(startRemoveExpense({id})).then(() => {
        const actions = store.getActions();
        expect(actions[0]).toEqual({
            type: "REMOVE_EXPENSE",
            id
        });
        return database.ref(`expenses/${id}`).once(value);
    }).then((snapshot) => {
        expect(snapshot.val()).toBeFalsy();
        done();
    });
});

test("should setup edit expense object", () => {
    const action = editExpense('123abc', { text: 'New note'});
    expect(action).toEqual({
        type: "EDIT_EXPENSE",
        id: '123abc',
        updates: {
            text: "New note"
        }
    });
});

test("should edit expense from firebase", () => {
    const store = createMockStore({});
    const id = expense[0].id;
    const updates = {amount: 21000};
    store.dispatch(startEditExpense(id, updates)).then(() => {
        const actions = store.getActions();
        expect(actions[0]).toEqual({
            type: 'EDIT_EXPENSE',
            id,
            updates
        });
        return database.ref(`expenses/${id}`).once('value');
    }).then((snapshot) => {
        expect(snapshot.val().amount).toBe(updates.amount);
        done();
    });
});

test("should setup add expense object default",() => {
    const action = addExpense(expenses[2]);
    expect(action).toEqual({
        type: "ADD_EXPENSE",
        expense: expenses[2]
    });
});

test("should add expense to database and store", (done) => {//done is used for asynchronous functions to make jest wait till done is called to pass/fail the test case.
    const store = createMockStore({});//jest by default doesn't wait for asynchronous and will run as is.
    const expenseData = {
        description: "Mouse",
        amount: 3000,
        text: "This one is better",
        createdAt: 1000
    };
    store.dispatch(startAddExpense(expenseData)).then(() => {
        const action = store.getActions();
        expect(action[0]).toEqual({
            type: 'ADD_EXPENSE',
            expense: {
                id: expect.any(String),
                ...expenseData
            }
        });
        return database.ref(`expense/${action[0].expense.id}`).once('value');
    }).then((snapshot) =>{
        expect(snapshot.val()).toEqual(expenseData);
        done();
    });
});


test("should add expense to database and store", (done) => {
    const store = createMockStore({});
    const expenseDefault = {
        description: "",
        amount: 0,
        text: "",
        createdAt: 0
    };
    store.dispatch(startAddExpense({})).then(() => {
        const action = store.getActions();
        expect(action[0]).toEqual({
            type: 'ADD_EXPENSE',
            expense: {
                id: expect.any(String),
                ...expenseDefault
            }
        });
        return database.ref(`expense/${action[0].expense.id}`).once('value');
    }).then((snapshot) =>{
        expect(snapshot.val()).toEqual(expenseDefault);
        done();
    });
});


test('should setup set expense action object with data', () => {
    const action = setExpenses(expenses);
    expect(action).toEqual({
      type: 'SET_EXPENSES',
      expenses
    });
});

test('should fetch the expenses from firebase', (done) => {
    const store = createMockStore({});
    store.dispatch(startSetExpenses()).then(() => {
      const actions = store.getActions();
      expect(actions[0]).toEqual({
        type: 'SET_EXPENSES',
        expenses
      });
      done();
    });
});

// test("should setup add expense object default",() => {
//     const expenseData = {description: '123', text: 'text', amount: 10000, createdAt: 12345};
//     const action = addExpense(expenseData);
//     expect(action).toEqual({
//         type: "ADD_EXPENSE",
//         expense: {
//             ...expenseData,
//             id: expect.any(String)
//         }
//     });
// });

//OR
// test("should setup add expense object default",() => {
//     const action = addExpense({description: '123', text: 'text', amount: 10000, createdAt: 12345});
//     expect(action).toEqual({
//         type: "ADD_EXPENSE",
//         expense: {
//             description: '123',
//             text: 'text',
//             amount: 10000,
//             createdAt: 12345,
//             id: expect.any(String)
//         }
//     });
// });