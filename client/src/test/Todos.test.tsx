import { act, render, waitFor,screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Auth from '../auth/Auth'
import { Todos } from '../components/Todos'
import { History } from 'history'
import * as API from '../api/todos-api'

const auth: Auth = {
  accessToken: 'fff',
  idToken: 'ffff',
  expiresAt: 'ffff',
  auth0: jest.fn(),
  getAccessToken: jest.fn(),
  getIdToken: jest.fn(),
  handleAuthentication: jest.fn(),
  history: jest.fn(),
  isAuthenticated: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  renewSession: jest.fn(),
  setSession: jest.fn()
}
const historyMock: History = {
  length: 2,
  action: 'REPLACE',
  location: {
    pathname: '/',
    search: '',
    hash: '',
    key: 'se921n',
    state: ''
  },
  block: jest.fn(),
  createHref: jest.fn(),
  go: jest.fn(),
  goBack: jest.fn(),
  goForward: jest.fn(),
  listen: jest.fn(),
  push: jest.fn(),
  replace: jest.fn()
}
const mockData = [
  {
    todoId: '4a093a6f-3927-4a22-9754-085b6e961eca',
    userId: 'google-oauth2|103303390409976191104',
    attachmentUrl:
      'https://my-serverless-s3-dev.s3.amazonaws.com/4a093a6f-3927-4a22-9754-085b6e961eca',
    dueDate: '2023-05-09',
    createdAt: '2023-05-02T06:37:18.063Z',
    name: 'learning',
    done: true
  }
]
const TodoListComponent = <Todos auth={auth} history={historyMock} />

describe('check render todo list', async () => {
  beforeEach(async () => {
    jest
      .spyOn(API, 'getTodos')
      .mockImplementation(() => Promise.resolve(mockData))
    await act(async () => {
      render(TodoListComponent)
    })
  })

  it('should render and match the snapshot', async () => {
    const { asFragment } = render(TodoListComponent)
    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot()
    })
  })

  it('should render fetch api', () => {
    expect(API.getTodos).toBeCalled()
  })

  it('should show correct data', () => {
    const testLabel = screen.getByText('learning')
    expect(testLabel).toBeInTheDocument()
  })

  it('should call to open modal when click on delete button', async () => {
    const btnDelete = screen.getAllByRole('button')
    fireEvent.click(btnDelete[3])
    expect(screen.getByText('Are you sure you want to delete this task?')).toBeInTheDocument()
  })
})
