defmodule PulsarWeb.SlidesController do
  use PulsarWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end