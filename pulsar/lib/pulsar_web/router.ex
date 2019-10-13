defmodule PulsarWeb.Router do
  use PulsarWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", PulsarWeb do
    pipe_through :browser

    get "/", PageController, :index

    get "/clicker", ClickerController, :index

    get "/slides", SlidesController, :index
  end

  # Other scopes may use custom stacks.
  # scope "/api", PulsarWeb do
  #   pipe_through :api
  # end
end
