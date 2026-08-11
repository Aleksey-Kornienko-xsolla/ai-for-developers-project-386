import "@typespec/http";

using TypeSpec.Http;

/** Доступные длительности события (минуты). Произвольное значение 5..480. */
@minValue(5)
@maxValue(480)
scalar DurationMinutes extends int16;

/** Идентификатор типа события — slug, задаваемый владельцем (например, "intro-call"). */
@pattern("^[a-z0-9][a-z0-9-]{0,49}$")
scalar EventTypeId extends string;

/** Идентификатор слота — UTC-слаг формата YYYYMMDDTHHMM (например, 20260811T0930). */
@pattern("^\\d{8}T\\d{4}$")
scalar SlotId extends string;

/** Гость — тот, кто бронирует слот. Без аккаунта. */
model Guest {
  /** Имя гостя. */
  @minLength(1)
  name: string;

  /** Email гостя для связи. */
  @pattern("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")
  email: string;
}

/** Единственный владелец календаря. Профиль задан заранее, без регистрации. */
model Owner {
  /** Фиксированный идентификатор владельца. */
  @pattern("^owner$")
  id: string;

  /** Имя владельца, отображается гостям. */
  @minLength(1)
  name: string;

  /** Email владельца, куда приходят брони (в админке задаётся один раз). */
  @pattern("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")
  email: string;
}

/** Тип события, создаваемый владельцем. Длительность произвольная 5..480 минут. */
model EventType {
  /** Идентификатор-slug, задаваемый владельцем (например, "intro-call"). */
  id: EventTypeId;

  /** Название типа события, отображается гостям. */
  @minLength(1)
  name: string;

  /** Описание типа события (текст для гостей). */
  description: string;

  /** Длительность в минутах (5..480). */
  durationMinutes: DurationMinutes;
}

/** Статус слота для бронирования. */
union SlotStatus {
  available: "available",
  booked: "booked",
}

/** Кандидат на бронь, генерируется сервером на 14 дней вперёд, сетка 15 мин, UTC. */
model Slot {
  /** Идентификатор слота, UTC-слаг YYYYMMDDTHHMM. */
  id: SlotId;

  /** Начало слота в UTC. */
  startUtc: utcDateTime;

  /** Конец слота в UTC = startUtc + durationMinutes. */
  endUtc: utcDateTime;

  /** Длительность слота в минутах (берётся из типа события). */
  durationMinutes: DurationMinutes;

  /** Текущая доступность слота. */
  status: SlotStatus;
}

/** Созданное гостем бронирование. */
model Booking {
  /** Идентификатор брони. */
  @format("uuid")
  id: string;

  /** Идентификатор забронированного слота. */
  slotId: SlotId;

  /** Тип события, по которому создана бронь. */
  eventType: EventType;

  /** Начало встречи в UTC (дублирует данные слота для удобства фронта). */
  startUtc: utcDateTime;

  /** Конец встречи в UTC. */
  endUtc: utcDateTime;

  /** Данные гостя. */
  guest: Guest;

  /** Время создания брони в UTC. */
  createdAt: utcDateTime;
}

/** Тело запроса на создание бронирования. */
model BookingRequest {
  /** Идентификатор слота, который гость хочет забронировать. */
  slotId: SlotId;

  /** Данные гостя. */
  guest: Guest;
}

/** Тело запроса на обновление профиля владельца. */
model UpdateOwnerRequest {
  @minLength(1)
  name: string;

  @pattern("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")
  email: string;
}

/** Тело запроса на создание типа события. id задаёт владелец, далее не меняется. */
model CreateEventTypeRequest {
  /** Slug типа события, уникальный. */
  id: EventTypeId;

  /** Название. */
  @minLength(1)
  name: string;

  /** Описание. */
  description: string;

  /** Длительность в минутах (5..480). */
  durationMinutes: DurationMinutes;
}

/** Тело запроса на обновление типа события. id не меняется (в path). */
model UpdateEventTypeRequest {
  /** Название. */
  @minLength(1)
  name: string;

  /** Описание. */
  description: string;

  /** Длительность в минутах (5..480). */
  durationMinutes: DurationMinutes;
}

/** Ответ с ошибкой (упрощённый набор для MVP). */
model ErrorResponse {
  /** HTTP-статус. */
  status: int16;

  /** Краткое сообщение об ошибке. */
  @minLength(1)
  message: string;
}