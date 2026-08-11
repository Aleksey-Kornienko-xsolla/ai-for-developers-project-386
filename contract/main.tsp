import "@typespec/http";
import "@typespec/openapi3";
import "./models.tsp";
import "./public.tsp";
import "./admin.tsp";

using TypeSpec.Http;

@service({
  title: "Booking",
})
@server("https://booking.example.com", "Production")
namespace BookingApp;