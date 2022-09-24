import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Header from '../header/header';

it("Test footer exists on page render", () => {
    render(<Header/>);
    const text = screen.getByText('Chat Mania !');
    expect(text).toBeInTheDocument();
})
