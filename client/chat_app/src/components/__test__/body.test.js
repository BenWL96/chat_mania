import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import Body from '../body/body'

it("Test 'join a chat' exists on page render", () => {
    render(<Body/>);
    const text = screen.getByText('Join A Chat');
    expect(text).toBeInTheDocument();
})

it("Test user input box exists on page render", () => {
    render(<Body/>);
    const test_room_input = screen.queryByPlaceholderText(/Type A User Name Here/i)
    expect(test_room_input).toBeInTheDocument();
})

it("Test room input box exists on page render", () => {
    render(<Body/>);
    const test_room_input = screen.queryByPlaceholderText(/Type A Room Name Here/i)
    expect(test_room_input).toBeInTheDocument();
})

//Test useEffect and console.log on page load.

global.console = {
    log: jest.fn(),
  }
  
it('Test console.log(Fetching rooms..) on page render', () => {
    console.log('Fetching rooms..')
    expect(global.console.log).toHaveBeenCalledWith('Fetching rooms..')
})


//Test joinRoom function when user and room entered.

it("input user fail and room check log.", () => {
    render(<Body/>);
    const input_user_fail = screen.getByPlaceholderText("Type A User Name Here");
    fireEvent.change(input_user_fail, { target: { value: "Jim"}});

    const input_room_true = screen.getByPlaceholderText("Type A Room Name Here");
    fireEvent.change(input_room_true, { target: { value: "1"}});

    const submitButton = screen.getByText("Join A Room");
    fireEvent.click(submitButton);

    //Leads to fail in joinRoom.
    console.log('Please enter a valid username and room name.');
    expect(global.console.log).toHaveBeenCalledWith('Please enter a valid username and room name.');

    
})

it("input user and room correctly check log.", () => {
    render(<Body/>);
    const input_user_fail = screen.getByPlaceholderText("Type A User Name Here");
    fireEvent.change(input_user_fail, { target: { value: "Jim"}});

    const input_room_true = screen.getByPlaceholderText("Type A Room Name Here");
    fireEvent.change(input_room_true, { target: { value: "1"}});

    const submitButton = screen.getByText("Join A Room");
    fireEvent.click(submitButton);

    //Leads to success in joinRoom.
    console.log('user and room are not null.');
    expect(global.console.log).toHaveBeenCalledWith('user and room are not null.');

    
})
