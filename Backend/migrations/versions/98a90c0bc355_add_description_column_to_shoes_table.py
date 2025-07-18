"""Add description column to Shoes table

Revision ID: 98a90c0bc355
Revises: 8e4c6f5e244e
Create Date: 2025-06-02 22:11:32.287742

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '98a90c0bc355'
down_revision = '8e4c6f5e244e'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('Shoes', schema=None) as batch_op:
        batch_op.add_column(sa.Column('description', sa.Text(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('Shoes', schema=None) as batch_op:
        batch_op.drop_column('description')

    # ### end Alembic commands ###
