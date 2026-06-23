import { NotFoundException } from "@nestjs/common";
import { DeleteAppointmentUseCase } from "./delete-appointment.use-case";

describe("DeleteAppointmentUseCase", () => {
  let useCase: DeleteAppointmentUseCase;
  let appointmentRepo: any;

  beforeEach(() => {
    appointmentRepo = {
      findOne: jest.fn(),
      softRemove: jest.fn(),
    };
    useCase = new DeleteAppointmentUseCase(appointmentRepo);
  });

  it("should soft delete the appointment successfully if it exists", async () => {
    const existingAppointment = {
      id: 1,
      tipo: "CONSULTA",
      status: "CONFIRMADO",
    };

    appointmentRepo.findOne.mockResolvedValue(existingAppointment);
    appointmentRepo.softRemove.mockResolvedValue(existingAppointment);

    await useCase.execute(1);

    expect(appointmentRepo.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(appointmentRepo.softRemove).toHaveBeenCalledWith(existingAppointment);
  });

  it("should throw NotFoundException if appointment does not exist", async () => {
    appointmentRepo.findOne.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(NotFoundException);
    expect(appointmentRepo.softRemove).not.toHaveBeenCalled();
  });
});
