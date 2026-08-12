import "@typespec/http";
import "./models.tsp";

using TypeSpec.Http;

namespace BookingApp {
  /** Admin-сценарий: без аутентификации (упрощение MVP). Владелец один. */

  /** Управление профилем владельца. */
  @route("/api/v1/admin/owner")
  interface OwnerManagement {
    /** Получить текущий профиль владельца. */
    @get
    getOwner(): Owner | ErrorResponse;

    /** Задать/обновить профиль владельца (имя + email). */
    @put
    updateOwner(@body body: UpdateOwnerRequest): Owner | ErrorResponse;
  }

  /** CRUD типов событий владельцем.
   *
   * Сценарии:
   *   - Создать тип: POST с { id, name, description, durationMinutes } → 201 / 409 slug занят.
   *   - Список типов: GET → 200 EventType[].
   *   - Изменить: PUT /{id} с { name, description, durationMinutes } → 200 / 404.
   *   - Удалить: DELETE /{id} → 204 / 404 / 409 (есть брони — запрещено).
   */
  @route("/api/v1/admin/event-types")
  interface EventTypeManagement {
    /** Список всех типов события (управленческий, включая все активные). */
    @get
    listEventTypes(): EventType[];

    /** Создать тип события. id-slug задаёт владелец, должен быть уникальным. */
    @post
    createEventType(@body body: CreateEventTypeRequest): EventType | ErrorResponse;

    /** Получить один тип события по slug. */
    @get
    @route("{id}")
    getEventType(@path id: EventTypeId): EventType | ErrorResponse;

    /** Обновить название/описание/длительность. id не меняется. */
    @put
    @route("{id}")
    updateEventType(
      @path id: EventTypeId,
      @body body: UpdateEventTypeRequest,
    ): EventType | ErrorResponse;

    /** Удалить тип события. Запрещено (409), если по типу есть бронирования. */
    @delete
    @route("{id}")
    deleteEventType(@path id: EventTypeId): void | ErrorResponse;
  }

  /** Страница предстоящих встреч: все будущие брони всех типов в одном списке. */
  @route("/api/v1/admin/bookings")
  interface BookingsManagement {
    /** Список будущих бронирований (startUtc > now), отсортирован по startUtc asc.
     * Без пагинации (MVP). Брони всех типов событий в одном массиве.
     */
    @get
    listUpcomingBookings(): Booking[];
  }
}