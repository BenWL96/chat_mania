import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Footer from '../footer/footer';

it("Test footer exists on page render", () => {
    render(<Footer/>);
    const text = screen.getByText('Footer Section');
    expect(text).toBeInTheDocument();
})
