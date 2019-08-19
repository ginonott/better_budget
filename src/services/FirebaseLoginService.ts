import { ILoginService } from "./ILoginService";
import firebase from "firebase";

export class FirebaseLoginService implements ILoginService {
  login(username: string, password: string) {
    return firebase.auth().signInWithEmailAndPassword(username, password);
  }
}
