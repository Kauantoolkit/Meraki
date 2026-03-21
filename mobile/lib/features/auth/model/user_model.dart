class UserModel {
  final String id;
  final String name;
  final String email;
  final String userType; // 'COMPANY' | 'SPECIALIST'
  final String? token;

  const UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.userType,
    this.token,
  });

  bool get isCompany => userType == 'COMPANY';
  bool get isSpecialist => userType == 'SPECIALIST';

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      userType: json['userType'] as String,
      token: json['token'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'email': email,
        'userType': userType,
        if (token != null) 'token': token,
      };

  UserModel copyWith({String? token}) {
    return UserModel(id: id, name: name, email: email, userType: userType, token: token ?? this.token);
  }
}
