defmodule PulsarWeb.LayoutView do
  use PulsarWeb, :view

  def static_js_for_view(Elixir.PulsarWeb.ClickerView) do
    "/js/clicker-app.js"
  end
  def static_js_for_view(_template) do
    "/js/audience-app.js"
  end

    def static_css_for_view(Elixir.PulsarWeb.ClickerView) do
    "/css/clicker-app.css"
  end
  def static_css_for_view(_template) do
    "/css/audience-app.css"
  end

end
