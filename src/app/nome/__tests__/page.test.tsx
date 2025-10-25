import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import NomePage from '../page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Zustand store
jest.mock('@/store/gameStore', () => ({
  useGameStore: jest.fn(),
}));

describe('NomePage', () => {
  const mockPush = jest.fn();
  const mockSetPlayerName = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (useGameStore as jest.Mock).mockReturnValue({
      setPlayerName: mockSetPlayerName,
    });

    jest.clearAllMocks();
  });

  it('renders the form with required fields', () => {
    render(<NomePage />);
    
    expect(screen.getByLabelText('Primeiro Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Último Nome')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    render(<NomePage />);
    
    const submitButton = screen.getByRole('button', { name: 'Continuar' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Primeiro nome é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Último nome é obrigatório')).toBeInTheDocument();
    });

    expect(mockSetPlayerName).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows validation error when only first name is filled', async () => {
    render(<NomePage />);
    
    const firstNameInput = screen.getByLabelText('Primeiro Nome');
    const submitButton = screen.getByRole('button', { name: 'Continuar' });

    fireEvent.change(firstNameInput, { target: { value: 'João' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Último nome é obrigatório')).toBeInTheDocument();
    });

    expect(screen.queryByText('Primeiro nome é obrigatório')).not.toBeInTheDocument();
    expect(mockSetPlayerName).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows validation error when only last name is filled', async () => {
    render(<NomePage />);
    
    const lastNameInput = screen.getByLabelText('Último Nome');
    const submitButton = screen.getByRole('button', { name: 'Continuar' });

    fireEvent.change(lastNameInput, { target: { value: 'Silva' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Primeiro nome é obrigatório')).toBeInTheDocument();
    });

    expect(screen.queryByText('Último nome é obrigatório')).not.toBeInTheDocument();
    expect(mockSetPlayerName).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('submits successfully when both fields are filled', async () => {
    render(<NomePage />);
    
    const firstNameInput = screen.getByLabelText('Primeiro Nome');
    const lastNameInput = screen.getByLabelText('Último Nome');
    const submitButton = screen.getByRole('button', { name: 'Continuar' });

    fireEvent.change(firstNameInput, { target: { value: 'João' } });
    fireEvent.change(lastNameInput, { target: { value: 'Silva' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSetPlayerName).toHaveBeenCalledWith('João', 'Silva');
      expect(mockPush).toHaveBeenCalledWith('/personagem');
    });

    expect(screen.queryByText('Primeiro nome é obrigatório')).not.toBeInTheDocument();
    expect(screen.queryByText('Último nome é obrigatório')).not.toBeInTheDocument();
  });

  it('trims whitespace from names before saving', async () => {
    render(<NomePage />);
    
    const firstNameInput = screen.getByLabelText('Primeiro Nome');
    const lastNameInput = screen.getByLabelText('Último Nome');
    const submitButton = screen.getByRole('button', { name: 'Continuar' });

    fireEvent.change(firstNameInput, { target: { value: '  João  ' } });
    fireEvent.change(lastNameInput, { target: { value: '  Silva  ' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSetPlayerName).toHaveBeenCalledWith('João', 'Silva');
    });
  });

  it('navigates back to home when back button is clicked', () => {
    render(<NomePage />);
    
    const backButton = screen.getByText('← Voltar ao início');
    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith('/');
  });
});