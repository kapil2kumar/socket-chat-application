exports.login = {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        required: true,
        errorMessages:{
            "required": "Email is Required",
        }
      },
      password: {
        type: 'string',
        required: true,
        errorMessages:{
            "required": "Password is Required",
        }
      }
    }
  };


exports.addUser = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        required: true,
        errorMessages:{
            "required": "Name is Required",
        }
      },
      role: {
        type: 'string',
        required: true,
        errorMessages:{
            "required": "Role is Required",
        }
      },
      email: {
        type: 'string',
        required: true,
        errorMessages:{
            "required": "Email is Required",
        }
      },
      password: {
        type: 'string',
        required: true,
        errorMessages:{
            "required": "Password is Required",
        }
      }
    }
  };

exports.editUser = {
    type: 'object',
    properties: {
      _id: {
        type: 'string',
        required: true,
        errorMessages:{
            "required": "Id is Required",
        }
      },
      name: {
        type: 'string',
        required: true,
        errorMessages:{
            "required": "Name is Required",
        }
      },
      role: {
        type: 'string',
        required: true,
        errorMessages:{
            "required": "Role is Required",
        }
      },
      email: {
        type: 'string',
        required: true,
        errorMessages:{
            "required": "Email is Required",
        }
      }
    }
  };
