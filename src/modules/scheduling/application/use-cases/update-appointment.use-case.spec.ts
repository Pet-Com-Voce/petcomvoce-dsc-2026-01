import { NotFoundException } from "@nestjs/common";
import { UpdateAppointmentUseCase } from "./update-appointment.use-case";
import { AppointmentType, AppointmentStatus } from "../../domain/entities/appointment.entity";

describe("UpdateAppointmentUseCase", () => {
  let useCase: UpdateAppointmentUseCase;
  let appointmentRepo: any;

  beforeEach(() => {
    appointmentRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    useCase = new UpdateAppointmentUseCase(appointmentRepo);
  });

  it("should update appointment successfully (happy path)", async () => {
    const existingAppointment = {
      id: 1,
      tipo: AppointmentType.CONSULTA,
      status: AppointmentStatus.CONFIRMADO,
      duracao: 30,
      observacoes: "Old observations",
    };

    const updateDto = {
      duracao: 45,
      observacoes: "New updated observations",
    };

    appointmentRepo.findOne.mockResolvedValue(existingAppointment);
    appointmentRepo.save.mockImplementation((x) => Promise.resolve(x));

    const result = await useCase.execute(1, updateDto);

    expect(result).toBeDefined();
    expect(result.duracao).toBe(45);
    expect(result.observacoes).toBe("New updated observations");
    expect(result.tipo).toBe(AppointmentType.CONSULTA); // Unchanged field
    expect(appointmentRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      id: 1,
      duracao: 45,
      observacoes: "New updated observations",
    }));
  });

  it("should throw NotFoundException if appointment does not exist", async () => {
    appointmentRepo.findOne.mockResolvedValue(null);

    await expect(useCase.execute(999, { duracao: 45 })).rejects.toThrow(
      NotFoundException,
    );
    expect(appointmentRepo.save).not.toHaveBeenCalled();
  });

  it("should complete update with empty payload leaving record unchanged", async () => {
    const existingAppointment = {
      id: 1,
      tipo: AppointmentType.CONSULTA,
      status: AppointmentStatus.CONFIRMADO,
      duracao: 30,
      observacoes: "Old observations",
    };

    appointmentRepo.findOne.mockResolvedValue(existingAppointment);
    appointmentRepo.save.mockImplementation((x) => Promise.resolve(x));

    const result = await useCase.execute(1, {});

    expect(result).toEqual(existingAppointment);
    expect(appointmentRepo.save).toHaveBeenCalledWith(existingAppointment);
  });
});
