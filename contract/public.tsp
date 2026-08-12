import "@typespec/http";
import "./models.tsp";

using TypeSpec.Http;

namespace BookingApp {
  /** Публичный сценарий гостя: без авторизации. */
  @route("/api/v1/event-types")
  interface Public {
    /** Список доступных длительностей события (15 и 30 минут). */
    @get
    listEventTypes(): EventType[];

    /** Описание одного типа события по ссылке-приглашению вида /booking/{id}. */
    @get
    @route("{id}")
    getEventType(@path id: EventTypeId): EventType | ErrorResponse;

    /** Свободные слоты на 14 дней вперёд от сегодня (UTC), сетка 15 минут. */
    @get
    @route("{id}/availability")
    listAvailability(
      @path id: EventTypeId,
      @query fromUtc?: utcDateTime,
      @query toUtc?: utcDateTime,
    ): Slot[] | ErrorResponse;

    /** Создать бронирование выбранным слотом. Идемпотентность по Idempotency-Key.
     * 201 Booking | 409 если слот занят | 404 если eventTypeId/слот не найдены.
     */
    @post
    @route("{id}/bookings")
    createBooking(
      @path id: EventTypeId,
      @body body: BookingRequest,
      @header("Idempotency-Key") idempotencyKey: string,
    ): Booking | ErrorResponse;
  }
}