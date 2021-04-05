import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase"
import { GetBalanceError } from "./GetBalanceError"
import { GetBalanceUseCase } from "./GetBalanceUseCase"

describe("Get Balance Use Case", () => {
  let statementsRepositoryInMemory: InMemoryStatementsRepository
  let usersRepositoryInMemory: InMemoryUsersRepository
  let createUserUseCase: CreateUserUseCase
  let createStatementUseCase: CreateStatementUseCase
  let getBalanceUseCase: GetBalanceUseCase

  enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
  }

  interface IOperationGenerator {
    amount: number;
    description: string;
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
    type: OperationType.DEPOSIT
  }

  const userData: ICreateUserDTO = {
    name: "Test User",
    email: "user@test.com",
    password: "test123"
  }

  const getRandom = (min:number, max:number) => Math.floor(Math.random() * (max - min + 1)) + min

  const operationsGenerator = (min:number, max:number): IOperationGenerator[] =>{
    const NUMBER_GENERATOR =getRandom(min, max)
    const operations = []

    for(let i = 0; i < NUMBER_GENERATOR; i++){
      operations.push({
        amount: 500,
        description: "Test"
      })
    }

    return operations
  }

  const operationsGeneratorDeposit = async (
    operations:IOperationGenerator[],
    user_id: string
  ): Promise<number > => {
    const results = await Promise.all( operations.map((operation)=>
      createStatementUseCase.execute({
        type: OperationType.DEPOSIT,
        user_id,
        amount: operation.amount,
        description: operation.description
      })
    ))

    const total = results.reduce((previous, current) => {
      return previous += current.amount
    },0)

    return total
  }

  const operationsGeneratorWithdraw = async (
    operations:IOperationGenerator[],
    user_id: string
  ): Promise<number > => {
    const results = await Promise.all( operations.map((operation)=>
      createStatementUseCase.execute({
        type: OperationType.WITHDRAW,
        user_id,
        amount: operation.amount,
        description: operation.description
      })
    ))

    const total = results.reduce((previous, current) => {
      return previous += current.amount
    },0)

    return total
  }

  beforeEach(() => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository()
    usersRepositoryInMemory = new InMemoryUsersRepository()
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    )
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory)
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepositoryInMemory,
      usersRepositoryInMemory
    )
  })

  it("must be able to get balance per existing user using the user ID", async() => {
    const user = await createUserUseCase.execute(userData)

    const amountDepositTotal = await operationsGeneratorDeposit(operationsGenerator(6, 10), `${user.id}`)
    const amountWithdrawTotal = await operationsGeneratorWithdraw(operationsGenerator(1,5), `${user.id}`)

    const amountTotal = amountDepositTotal - amountWithdrawTotal

    const {balance} = await getBalanceUseCase.execute({user_id: `${user.id}`})

    expect(balance).toBe(amountTotal)
  })

  it("should no be able to get balance if it user not exists", async () => {
    await expect(async () =>
      await getBalanceUseCase.execute({user_id: "not exists"})
    ).rejects.toBeInstanceOf(GetBalanceError)
  })
})
