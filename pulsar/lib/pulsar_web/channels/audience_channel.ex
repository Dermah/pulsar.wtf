defmodule PulsarWeb.AudienceChannel do
  use Phoenix.Channel

  def join("audience:lobby", _message, socket) do
    {:ok, socket}
  end

  def join("audience:" <> _private_room_id, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  def handle_in("click", params, socket) do
    broadcast!(socket, "pulse", params)
    {:noreply, socket}
  end
end
