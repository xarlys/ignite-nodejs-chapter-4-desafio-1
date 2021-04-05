import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementError } from "./CreateStatementError"
import { CreateStatementUseCase } from "./CreateStatementUseCase"

describe("Create Statement Use Case", () => {
  enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
  }

  interface ICreateStatementDTO {
    user_id: string;
    amount: number;
    description: string;
    type: OperationType
  }

  const statementData: ICreateStatementDTO = {
    user_id: "",
    amount: 0,
    description: "Statement Test",
    type: OperationType.WITHDRAW
  }

  const userData: ICreateUserDTO = {
    name: "Test Admin",
    email: "admin@test.com",
    password: "test123"
  }

  let usersRepositoryInMemory: InMemoryUsersRepository
  let statementsRepositoryInMemory: InMemoryStatementsRepository
  let createUserUseCase: CreateUserUseCase
  let createStatementUseCase: CreateStatementUseCase

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository()
    statementsRepositoryInMemory = new InMemoryStatementsRepository()
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory)
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory,statementsRepositoryInMemory)
  })

  it("should be able to create a new statement", async () => {
    const user = await createUserUseCase.execute(userData)

    const statement = await createStatementUseCase.execute({
      ...statementData,
      user_id: `${user.id}`
    })

    expect(statement).toHaveProperty("id")
    expect(statement.user_id).toEqual(user.id)
    expect(statement.type).toEqual(OperationType.WITHDRAW)
    expect(statement.amount).toEqual(statementData.amount)
    expect(statement.description).toEqual(statementData.description)
  })

  it("should no be able to create a new statement it if user not exists", async () => {
    await expect(async () => await createStatementUseCase.execute(statementData))
      .rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })

  it("should no be able to create a new statement it if user not exists", async () => {
    const user = await createUserUseCase.execute(userData)

    await expect(async () => await createStatementUseCase.execute({
      ...statementData,
      amount: 1000,
      user_id: `${user.id}`
    })).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })
})
