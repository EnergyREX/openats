import { Password } from "./Password.ts"

// Mismo patrón que Email: un value object que valida en el constructor.
// Lo incluimos para reforzar el patrón y porque la regla es más rica
// (mayúscula + minúscula + número + mínimo 8 chars) => merece varios casos.
describe("Password (value object)", () => {
  it("acepta una contraseña que cumple todas las reglas", () => {
    const password = new Password("Segura123")
    expect(password.getValue()).toBe("Segura123")
  })

  // Cada caso aísla UNA regla rota. Si mañana cambia la validación, el test
  // que falle te dirá EXACTAMENTE qué regla dejó de cumplirse.
  it.each([
    ["sin mayúscula", "segura123"],
    ["sin minúscula", "SEGURA123"],
    ["sin número", "SeguraPass"],
    ["demasiado corta", "Seg123"],
  ])("rechaza una contraseña %s", (_motivo, invalida) => {
    expect(() => new Password(invalida)).toThrow()
  })
})
