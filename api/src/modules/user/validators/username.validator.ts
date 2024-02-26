import {
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';

@ValidatorConstraint({ name: 'username', async: false })
export class Username implements ValidatorConstraintInterface {
  validate(text: string) {
    if (!text) {
      return false;
    }

    return /^[a-zA-Z0-9]+$/.test(text);
  }

  defaultMessage() {
    return '($value) is invaid username!';
  }
}
