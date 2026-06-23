import { NotFoundException } from "@nestjs/common";
import { FindAppointmentByIdUseCase } from "./find-appointment-by-id.use-case";

describe("FindAppointmentByIdUseCase", () => {
  let useCase: FindAppointmentByIdUseCase;
  let appointmentRepo: any;

  beforeEach(() => {
    appointmentRepo = {
      findOne: jest.fn(),
    };
    useCase = new FindAppointmentByIdUseCase(appointmentRepo);
  });

  it("should return the appointment if it exists", async () => {
    const mockAppointment = {
      id: 1,
      tipo: "CONSULTA",
      status: "CONFIRMADO",
      petId: "pet-uuid",
      funcionarioId: "emp-uuid",
    };

    appointmentRepo.findOne.mockResolvedValue(mockAppointment);

    const result = await useCase.execute(1);

    expect(result).toEqual(mockAppointment);
    expect(appointmentRepo.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: ["pet", "funcionario"],
    });
  });

  it("should throw NotFoundException if appointment does not exist", async () => {
    appointmentRepo.findOne.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(
      NotFoundException,
    );
    await expect(useCase.execute(999)).rejects.toThrow(
      'Agendamento com ID "999" não encontrado.',
    );
  });
});
