import {
  Accessor,
  ParentComponent,
  Setter,
  createContext,
  createEffect,
  createResource,
  createSignal,
  useContext,
} from "solid-js"
import PouchDb from "pouchdb"
import { User } from "../../user/types/user.type"
import PouchDbAuthentication from "pouchdb-authentication"

PouchDb.plugin(PouchDbAuthentication)

const remoteConfig = {
  skip_setup: true,
  ajax: {
    cache: true,
    withCredentials: true,
  },
}
const LOCALE_DB: string = "VAQUANT_LOCALE_DB"
const REMOTE: string = import.meta.env.VITE_APP_COUCHDB || ""

let innerRemote: PouchDB.Database | null = null

const remoteDb = () => {
  if (!innerRemote) {
    innerRemote = new PouchDb(`${REMOTE}/vaquant`, remoteConfig)
  }
  return innerRemote
}

type ContextType = {
  user: Accessor<User | null>
  setUser: Setter<User | null>
  db: PouchDB.Database<{}>
  remoteDb: () => PouchDB.Database<{}>
}

const QueryContext = createContext<ContextType>()

export const QueryProvider: ParentComponent = ({ children }) => {
  const db = new PouchDb(LOCALE_DB)
  const [user, setUser] = createSignal<User | null>(null)
  const [_, { refetch }] = createResource(async () =>
    db
      .sync(remoteDb(), {
        live: true,
        retry: true,
        filter: "account/by_user",
        query_params: {
          userId: user()?.userId ?? "",
          // accountIds: [...store.getters.publicAccountIds],
        },
      })
      .on("change", (result: PouchDB.Replication.SyncResult<any>) => {
        if (result.direction === "pull") {
          // const hasDocOtherThanExchange = result.change.docs.some(
          //   (doc: any) => doc.doctype !== "exchange"
          // )
          // if (hasDocOtherThanExchange) {
          //   emit(SYNC)
          //   confirmation("Mise à jour...")
          // }
        } else if (result.direction === "push") {
          // emit(SYNC)
        }
      })
      .on("error", (error: any) => {
        // tslint:disable-next-line:no-console
        console.warn("on error", { error })
        if (error.name !== "unauthorized") {
          // queueNotifService.error(`une erreur s'est produite`)
        }
      })
  )

  createEffect(() => {
    if (user()) {
      refetch()
    }
  })

  const value = { user, setUser, db, remoteDb }

  return <QueryContext.Provider value={value}>{children}</QueryContext.Provider>
}

export const useQueryContext = () => {
  const context = useContext(QueryContext)
  if (!context) {
    throw new Error("useQueryContext: cannot find a QueryContext")
  }
  return context
}
