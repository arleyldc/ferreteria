"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { Role } from "@prisma/client";

/**
 * Register a new client user (public action)
 */
export async function registerClient(
  email: string,
  name: string,
  password: string,
) {
  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "El email ya está registrado" };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new client user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "CLIENTE",
        isActive: true,
      },
    });

    return { success: true, userId: user.id };
  } catch (error) {
    console.error("Error registering user:", error);
    return { error: "Error al registrar el usuario" };
  }
}

/**
 * Update user (admin only)
 */
export async function updateUser(
  userId: string,
  data: {
    name?: string;
    email?: string;
    role?: string;
    isActive?: boolean;
  },
) {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return { error: "No autorizado" };
    }

    // Validate role if provided
    const validRoles = ["ADMIN", "ALMACENISTA", "VENDEDOR", "CLIENTE"];
    if (data.role && !validRoles.includes(data.role)) {
      return { error: "Rol inválido" };
    }

    // Check if email is already taken by another user
    if (data.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser && existingUser.id !== userId) {
        return { error: "El email ya está registrado" };
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.role && { role: data.role as Role }),
        ...(typeof data.isActive === "boolean" && { isActive: data.isActive }),
      },
    });

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error updating user:", error);
    return { error: "Error al actualizar el usuario" };
  }
}

/**
 * Delete/deactivate user (admin only)
 */
export async function deleteUser(userId: string) {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return { error: "No autorizado" };
    }

    // Don't allow deleting the only admin
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN", isActive: true },
    });

    if (adminCount <= 1) {
      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (targetUser?.role === "ADMIN") {
        return { error: "No puedes eliminar el único administrador" };
      }
    }

    // Deactivate user instead of deleting
    const deactivatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return { success: true, user: deactivatedUser };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { error: "Error al eliminar el usuario" };
  }
}

export async function activateUser(userId: string) {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return { error: "No autorizado" };
    }

    // Don't allow deleting the only admin
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN", isActive: true },
    });

    if (adminCount <= 1) {
      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (targetUser?.role === "ADMIN") {
        return { error: "No puedes eliminar el único administrador" };
      }
    }

    // Deactivate user instead of deleting
    const activatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });

    return { success: true, user: activatedUser };
  } catch (error) {
    console.error("Error activating user:", error);
    return { error: "Error al activar el usuario" };
  }
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers() {
  try {
    const session = await auth();

    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return { error: "No autorizado" };
    }

    const users = await prisma.user.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return { success: true, users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { error: "Error al obtener usuarios" };
  }
}

export async function getOneUserByEmail(email: string) {
  try {
    const session = await auth();

    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return { error: "No autorizado" };
    }

    const user = await prisma.user.findFirst({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return { success: true, user };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { error: "Error al obtener el usuario" };
  }
}
