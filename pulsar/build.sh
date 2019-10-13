#!/bin/sh

export SECRET_KEY_BASE=$(mix phx.gen.secret)
mix deps.get --only prod
MIX_ENV=prod mix compile


npm run deploy --prefix ./assets
mix phx.digest

echo "  Done. To run:"
echo "PORT=4001 MIX_ENV=prod mix phx.server"
echo "  or detached:"
echo "PORT=4001 MIX_ENV=prod elixir --erl \"-detached\" -S mix phx.server"
