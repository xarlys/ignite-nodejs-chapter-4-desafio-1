import { AppError } from "../../../../shared/errors/AppError"
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "./CreateUserUseCase"
import { ICreateUserDTO } from "./ICreateUserDTO"

describe("Create User Use Case", () => {
  let createUserUseCase: CreateUserUseCase
  let usersRepositoryInMemory: InMemoryUsersRepository

  const userData: ICreateUserDTO = {
    name: "Test User",
    email: "user@test.com",
    password: "test123"
  }

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory)
  })

  it("should be able to create a new user", async() => {
    const user = await createUserUseCase.execute(userData)

    expect(user).toHaveProperty("id")
    expect(user).toHaveProperty("password")
    expect(user.name).toEqual(userData.name)
    expect(user.email).toEqual(userData.email)
    expect(user.password).not.toEqual(userData.password)
  })

  it("should not be able to create a user if it exists", async() => {
    await createUserUseCase.execute(userData)

    await expect(async() => {
      await createUserUseCase.execute(userData)
    }).rejects.toBeInstanceOf(AppError)

    })
})
