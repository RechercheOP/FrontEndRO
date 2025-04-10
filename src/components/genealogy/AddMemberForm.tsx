import { useState } from 'react';
import { MemberFormData } from '../../services/memberService';

interface AddMemberFormProps {
    onSubmit: (memberData: MemberFormData) => void;
    onCancel: () => void;
}

const AddMemberForm = ({ onSubmit, onCancel }: AddMemberFormProps) => {
    const [formData, setFormData] = useState<MemberFormData>({
        firstName: '',
        lastName: '',
        birthDate: '',
        birthPlace: '',
        deathDate: '',
        occupation: '',
        bio: '',
        photoUrl: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <></>
    )