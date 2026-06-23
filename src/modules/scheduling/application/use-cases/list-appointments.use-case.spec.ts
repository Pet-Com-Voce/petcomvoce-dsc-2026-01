import { ListAppointmentsUseCase } from "./list-appointments.use-case";

describe("ListAppointmentsUseCase", () => {
  let useCase: ListAppointmentsUseCase;
  let appointmentRepo: any;

  beforeEach(() => {
    appointmentRepo = {
      find: jest.fn(),
    };
    useCase = new ListAppointmentsUseCase(appointmentRepo);
  });

  it("should return all appointments", async () => {
    const mockAppointments = [
      {
        id: 1,
        tipo: "CONSULTA",
        status: "CONFIRMADO",
      },
      {
        id: 2,
        tipo: "HOTEL",
        status: "PENDENTE",
      },
    ];

    appointmentRepo.find.mockResolvedValue(mockAppointments);

    const result = await useCase.execute();

    expect(result).toEqual(mockAppointments);
    expect(appointmentRepo.find).toHaveBeenCalledWith({
      relations: ["pet", "funcionario"],
      order: { dataHora: "DESC" },
    });
  });
});
