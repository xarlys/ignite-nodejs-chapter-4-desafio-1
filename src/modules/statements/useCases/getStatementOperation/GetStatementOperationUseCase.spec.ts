import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase"
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO"
import { GetStatementOperationError } from "./GetStatementOperationError"
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase"

describe("Get Statement Operation Use Case", () => {
  let statementsRepositoryInMemory: InMemoryStatementsRepository
  let usersRepositoryInMemory: InMemoryUsersRepository
  let createUserUseCase: CreateUserUseCase
  let createStatementUseCase: CreateStatementUseCase
  let getStatementOperationUseCase: GetStatementOperationUseCase

  enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
  }

  const statementData: ICreateStatementDTO = {
    user_id: "",
    amount: 0,
    description: "Statement Test",
    type: OperationType.DEPOSIT
  }

  const userData: ICreateUserDTO = {
    name: "Test User",
    email: "user@test.com",
    password: "test123"
  }

  beforeEach(() => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository()
    usersRepositoryInMemory = new InMemoryUsersRepository()
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    )
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory)
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    )
  })

  it("should be able to get one statement operation", async () => {
    const user = await createUserUseCase.execute(userData)
    const statement = await createStatementUseCase.execute({
      ...statementData,
      user_id: `${user.id}`
    })

    const response = await getStatementOperationUseCase.execute({
      user_id: `${user.id}`,
      statement_id: `${statement.id}`
    })

    expect(response).toHaveProperty("id")
    expect(response).toHaveProperty("user_id")
    expect(response.type).toBe(statementData.type)
    expect(response.amount).toBe(statementData.amount)
    expect(response.description).toBe(statementData.description)
  })

  it("should no be able to get one statement operation if it user not exists", async () => {
    const user = await createUserUseCase.execute(userData)
    const statement = await createStatementUseCase.execute({
      ...statementData,
      user_id: `${user.id}`
    })

    await expect( async () => await getStatementOperationUseCase.execute({
      user_id: `${user.id}-invalid`,
      statement_id: `${statement.id}`
    })).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  })

  it("should no be able to get one statement operation if it statement operation not exists", async () => {
    const user = await createUserUseCase.execute(userData)
    const statement = await createStatementUseCase.execute({
      ...statementData,
      user_id: `${user.id}`
    })

    await expect( async () => await getStatementOperationUseCase.execute({
      user_id: `${user.id}`,
      statement_id: `${statement.id}-invalid`
    })).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })
})
