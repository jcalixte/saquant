export type User = {
  userId: string
  email: string
  premium: boolean
  slugEmail: string
  alias?: string
  firstname?: string
  lastname?: string
  roles?: string[]
  customerId?: string
  subscriptionId?: string
  salt?: string
}
