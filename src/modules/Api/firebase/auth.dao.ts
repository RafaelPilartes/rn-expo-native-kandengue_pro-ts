// modules/Api/firebase/auth.dao.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  reload,
  getIdToken
} from '@react-native-firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  collection,
  getDocs
} from '@react-native-firebase/firestore'
import { db, auth } from '@/config/firebase.config'
import type {
  IAuthRepository,
  LoginCredentials,
  RegisterData,
  AuthResponse
} from '@/core/interfaces/IAuthRepository'
import { DriverEntity } from '@/core/entities/Driver'
import { firebaseCollections } from '@/constants/firebaseCollections'
import type { UserStatus } from '@/types/enum'
import { DriverInterface } from '@/interfaces/IDriver'
import { convertFirestoreTimestamp } from '@/utils/formatDate'
import { generateId } from '@/helpers/generateId'
import { mapFirebaseError } from '@/helpers/mapFirebaseError'

export class FirebaseAuthDAO implements IAuthRepository {
  private auth = auth
  private driversRef = firebaseCollections.drivers.root

  // 🔹 REGISTRO - Usando ID próprio em vez do UID
  async register(driverData: RegisterData): Promise<AuthResponse> {
    try {
      console.log('Iniciando registro para:', driverData.email)

      // 1. Criar usuário no Firebase Auth
      const driverCredential = await createUserWithEmailAndPassword(
        this.auth,
        driverData.email,
        driverData.password
      )

      const firebaseUser = driverCredential.user

      // 🔹 GERAR: ID próprio (não usar UID do Firebase)
      const driverId: string = generateId('dri')

      // 2. Criar perfil do usuário no Firestore com ID próprio
      const driverEntity = new DriverEntity({
        ...driverData,
        id: driverId,
        status: 'active' as UserStatus,
        availability: 'available',
        email_verified: false,
        phone_verified: false,
        vehicle: undefined,
        is_online: false,
        rating: 0,
        created_at: new Date(),
        firebase_uid: firebaseUser.uid
      })

      // Validar dados
      const validation = driverEntity.validate()
      if (!validation.isValid) {
        await firebaseUser.delete()
        throw new Error(validation.errors.join(', '))
      }

      // 🔹 SALVAR: No Firestore usando o ID próprio
      await setDoc(
        doc(db, this.driversRef, driverId),
        this.sanitizeUserForFirestore(driverEntity)
      )

      // 3. Atualizar perfil no Firebase Auth
      await updateProfile(firebaseUser, {
        displayName: driverData.name
      })

      // 4. Enviar verificação por email
      await this.sendEmailVerification()

      console.log('✅ Email de verificação enviado para:', driverData.email)
      console.log('✅ Driver criado com ID:', driverId)

      return {
        driver: driverEntity,
        token: await getIdToken(firebaseUser)
      }
    } catch (error: any) {
      console.error('Erro no registro:', error)
      throw new Error(mapFirebaseError(error))
    }
  }

  // 🔹 LOGIN - Buscar por email em vez de UID
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      )

      const firebaseUser = userCredential.user

      // 🔹 BUSCAR: Driver pelo email (não pelo UID)
      const driversQuery = query(
        collection(db, this.driversRef),
        where('email', '==', firebaseUser.email?.toLowerCase())
      )
      const driverSnapshot = await getDocs(driversQuery)

      if (driverSnapshot.empty) {
        throw new Error('Perfil do motorista não encontrado')
      }

      // Pegar o primeiro documento (deve ser único por email)
      const driverDoc = driverSnapshot.docs[0]
      const driverData = driverDoc.data() as DriverInterface

      // Criar entidade
      const driverEntity = new DriverEntity({
        ...driverData,
        id: driverDoc.id, // 🔹 USAR ID do documento (nosso ID próprio)
        name: driverData.name || '',
        email: driverData.email || firebaseUser.email || '',
        phone: driverData.phone || '',
        status: driverData.status || 'active',
        entity_code: driverData.entity_code,
        photo: driverData.photo,
        email_verified: driverData.email_verified || false,
        phone_verified: driverData.phone_verified || false,
        vehicle: driverData.vehicle || undefined,
        is_online: driverData.is_online || false,
        rating: driverData.rating || 0,
        firebase_uid: driverData.firebase_uid || firebaseUser.uid, // 🔹 MANTER referência
        created_at:
          convertFirestoreTimestamp(driverData.created_at) || new Date(),
        updated_at: convertFirestoreTimestamp(driverData.updated_at),
        last_login: new Date()
      })

      // 🔹 ATUALIZAR: Usando nosso ID próprio
      await updateDoc(doc(db, this.driversRef, driverDoc.id), {
        last_login: new Date(),
        updated_at: new Date(),
        firebase_uid: firebaseUser.uid // 🔹 GARANTIR que tem a referência
      })

      return {
        driver: driverEntity,
        token: await getIdToken(firebaseUser)
      }
    } catch (error: any) {
      console.error('Erro no login:', error)
      throw new Error(mapFirebaseError(error))
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth)
      console.log('Logout realizado com sucesso')
    } catch (error: any) {
      console.error('Erro no logout:', error)
      throw new Error('Erro ao sair')
    }
  }

  // 🔹 GET CURRENT DRIVER - Buscar por Firebase UID ou email
  async getCurrentDriver(): Promise<DriverEntity | null> {
    try {
      const firebaseUser = this.auth.currentUser

      if (!firebaseUser) {
        return null
      }

      let driverDoc: any = null

      // 🔹 TENTAR 1: Buscar por firebase_uid
      const uidQuery = query(
        collection(db, this.driversRef),
        where('firebase_uid', '==', firebaseUser.uid)
      )
      const uidSnapshot = await getDocs(uidQuery)

      if (!uidSnapshot.empty) {
        driverDoc = uidSnapshot.docs[0]
      } else {
        // 🔹 TENTAR 2: Buscar por email (fallback)
        const emailQuery = query(
          collection(db, this.driversRef),
          where('email', '==', firebaseUser.email?.toLowerCase())
        )
        const emailSnapshot = await getDocs(emailQuery)

        if (!emailSnapshot.empty) {
          driverDoc = emailSnapshot.docs[0]

          // 🔹 ATUALIZAR: Adicionar firebase_uid se não tiver
          if (!driverDoc.data().firebase_uid) {
            await updateDoc(doc(db, this.driversRef, driverDoc.id), {
              firebase_uid: firebaseUser.uid,
              updated_at: new Date()
            })
          }
        }
      }

      if (!driverDoc) {
        console.warn('Nenhum driver encontrado para o usuário atual')
        return null
      }

      const driverData = driverDoc.data() as DriverInterface

      return new DriverEntity({
        id: driverDoc.id, // 🔹 USAR ID do documento
        name: driverData.name || firebaseUser.displayName || '',
        email: driverData.email || firebaseUser.email || '',
        phone: driverData.phone || '',
        status: driverData.status || 'active',
        availability: driverData.availability || 'available',
        entity_code: driverData.entity_code,
        photo: driverData.photo,
        email_verified:
          driverData.email_verified || firebaseUser.emailVerified || false,
        phone_verified: driverData.phone_verified || false,
        vehicle: driverData.vehicle || undefined,
        is_online: driverData.is_online || false,
        rating: driverData.rating || 0,
        firebase_uid: driverData.firebase_uid || firebaseUser.uid,
        created_at:
          convertFirestoreTimestamp(driverData.created_at) || new Date(),
        updated_at: convertFirestoreTimestamp(driverData.updated_at),
        last_login: convertFirestoreTimestamp(driverData.last_login)
      })
    } catch (error) {
      console.error('Erro ao buscar motorista atual:', error)
      return null
    }
  }
  async isAuthenticated(): Promise<boolean> {
    try {
      const user = this.auth.currentUser
      return !!user
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      return false
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email)
      console.log('Email de recuperação enviado para:', email)
    } catch (error: any) {
      console.error('Erro ao enviar email de recuperação:', error)
      throw new Error(mapFirebaseError(error))
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    throw new Error('Método não implementado - use o link do email')
  }

  // 🔹 Enviar verificação por email
  async sendEmailVerification(): Promise<void> {
    try {
      const currentUser = this.auth.currentUser

      if (!currentUser) {
        throw new Error('Usuário não autenticado')
      }

      if (currentUser.emailVerified) {
        console.log('Email já verificado')
        return
      }

      console.log('Enviando verificação por email para:', currentUser.email)
      await sendEmailVerification(currentUser)

      console.log('✅ Email de verificação enviado com sucesso')
    } catch (error: any) {
      console.error('❌ Erro ao enviar verificação por email:', error)
      throw new Error(mapFirebaseError(error))
    }
  }

  // 🔹 Verificar se email foi confirmado
  async checkEmailVerification(): Promise<boolean> {
    try {
      const currentUser = this.auth.currentUser

      if (!currentUser) {
        throw new Error('Usuário não autenticado')
      }

      await this.reloadDriver()
      return currentUser.emailVerified
    } catch (error: any) {
      console.error('Erro ao verificar email:', error)
      return false
    }
  }

  // 🔹 Recarregar dados do usuário
  async reloadDriver(): Promise<void> {
    try {
      const currentUser = this.auth.currentUser

      if (!currentUser) {
        return
      }

      await reload(currentUser)
      console.log('✅ Dados do usuário recarregados')
    } catch (error: any) {
      console.error('❌ Erro ao recarregar usuário:', error)
      throw new Error('Erro ao atualizar dados do usuário')
    }
  }

  // 🔹 UTILITÁRIO: Buscar driver por ID próprio
  async getDriverById(driverId: string): Promise<DriverEntity | null> {
    try {
      const driverDoc = await getDoc(doc(db, this.driversRef, driverId))

      if (!driverDoc.exists()) {
        return null
      }

      const driverData = driverDoc.data() as DriverInterface

      return new DriverEntity({
        id: driverDoc.id,
        ...driverData,
        created_at: convertFirestoreTimestamp(driverData.created_at),
        updated_at: convertFirestoreTimestamp(driverData.updated_at),
        last_login: convertFirestoreTimestamp(driverData.last_login)
      })
    } catch (error) {
      console.error('Erro ao buscar driver por ID:', error)
      return null
    }
  }

  private sanitizeUserForFirestore(driver: DriverEntity): any {
    const sanitized: any = { ...driver }
    delete sanitized.password
    return Object.fromEntries(
      Object.entries(sanitized).filter(([_, v]) => v !== undefined)
    )
  }
}
