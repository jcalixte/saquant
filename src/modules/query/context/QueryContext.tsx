import {
  ParentComponent,
  createContext,
  createEffect,
  createResource,
  useContext,
} from "solid-js"
import PouchDb from "pouchdb"
import { User } from "../../user/types/user.type"
import PouchDbAuthentication from "pouchdb-authentication"
import { createStore } from "solid-js/store"

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

type State = {
  user: User | null
  db: PouchDB.Database<{}>
}

type ContextType = [
  State,
  {
    setUser: (user: User) => void
    readonly remoteDb: () => PouchDB.Database<{}>
  },
]

const QueryContext = createContext<ContextType>([
  {
    user: null,
    db: new PouchDb(LOCALE_DB),
  },
  {},
])

export const QueryProvider: ParentComponent = ({ children }) => {
  const [state, setState] = createStore<State>({
    user: null,
    db: new PouchDb(LOCALE_DB),
  })

  const [_, { refetch }] = createResource(async () =>
    state.db
      .sync(remoteDb(), {
        live: true,
        retry: true,
        filter: "account/by_user",
        query_params: {
          userId: state.user?.userId ?? "",
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
      }),
  )

  createEffect(() => {
    if (state.user) {
      refetch()
    }
  })

  return (
    <QueryContext.Provider
      value={[
        state,
        { setUser: (user: User) => setState("user", user), remoteDb },
      ]}
    >
      {children}
    </QueryContext.Provider>
  )
}

export const useQueryContext = () => {
  const context = useContext(QueryContext)
  console.log("useQueryContext", context)

  if (!context) {
    throw new Error("useQueryContext: cannot find a QueryContext")
  }
  return context
}
