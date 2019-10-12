defmodule PulsarWeb.AudienceChannel do
  use Phoenix.Channel

  def join("audience:lobby", _message, socket) do
    {:ok, socket}
  end

  def join("audience:" <> _private_room_id, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end
end
