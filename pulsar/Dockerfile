FROM elixir:1.9.1-alpine

RUN mix local.hex --force
RUN mix local.rebar --force
RUN apk add --update nodejs nodejs-npm

ADD assets assets
ADD config config
ADD lib lib
ADD priv/gettext priv/gettext
ADD test test
ADD .formatter.exs .formatter.exs
ADD build.sh build.sh
ADD mix.exs mix.exs
ADD mix.lock mix.lock

RUN mix deps.get
RUN cd assets && npm install

RUN ./build.sh

EXPOSE 4000
CMD _build/prod/rel/pulsar/bin/pulsar start