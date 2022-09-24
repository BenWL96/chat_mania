import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import App from '../../app'

//Test all test displayed upon page render
it("Test 'join a chat' exists on page render", () => {
  render(<App/>);
  const text = screen.getByText('Join A Chat');
  expect(text).toBeInTheDocument();
})

it("Test 'Chat Mania !' exists on page render", () => {
  render(<App/>);
  const text = screen.getByText('Chat Mania !');
  expect(text).toBeInTheDocument();
})


it("Test 'Footer' exists on page render", () => {
  render(<App/>);
  const text = screen.getByText('Footer Section');
  expect(text).toBeInTheDocument();
})
