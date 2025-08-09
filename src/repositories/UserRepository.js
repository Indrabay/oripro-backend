/**
 * UserRepository defines database operations for User entities.
 * Implementations: e.g. PostgresUserRepository
 */
class UserRepository {
  // eslint-disable-next-line class-methods-use-this
  async findByEmail(_email) {
    throw new Error('Not implemented');
  }

  // eslint-disable-next-line class-methods-use-this
  async findById(_id) {
    throw new Error('Not implemented');
  }

  // eslint-disable-next-line class-methods-use-this
  async create(_user) {
    throw new Error('Not implemented');
  }
}

module.exports = { UserRepository };


