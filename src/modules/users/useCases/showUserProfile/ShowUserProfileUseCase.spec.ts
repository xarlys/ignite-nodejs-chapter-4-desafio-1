import { AppError } from "../../../../shared/errors/AppError"
import { User } from "../../entities/User"
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { ICreateUserDTO } from "../createUser/ICreateUserDTO"
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase"

describe("Show User Profile Use Case", () => {
  interface ITokenUser {
    user: User,
    token: string,
  }

  let usersRepositoryInMemory: InMemoryUsersRepository
  let createUserUseCase: CreateUserUseCase
  let showUserProfileUseCase: ShowUserProfileUseCase

  const userData: ICreateUserDTO = {
    name: "Test Admin",
    email: "admin@test.com",
    password: "test123"
  }

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory)
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepositoryInMemory)
  })

  it("should be able to get information user by id", async () => {
    const user = await createUserUseCase.execute(userData)

    const response = await showUserProfileUseCase.execute(user.id ?? "")

    expect(response).toHaveProperty("id")
    expect(response).toHaveProperty("password")
    expect(response.name).toEqual(userData.name)
    expect(response.email).toEqual(userData.email)
    expect(response.password).not.toEqual(userData.password)
  })

  it("should no be able to get information user if it id is invalid", async () => {
    await expect( async () => await showUserProfileUseCase.execute(""))
      .rejects.toBeInstanceOf(AppError)
  })
})
